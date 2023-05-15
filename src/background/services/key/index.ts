import { hexlify, toUtf8Bytes } from "ethers";
import nacl from "tweetnacl";
import util from "tweetnacl-util";

import { cryptoGenerateEncryptedHmac, cryptoGetAuthenticBackupCiphertext } from "@src/background/services/crypto";
import LockerService from "@src/background/services/lock";
import MiscStorageService from "@src/background/services/misc";
import { mnemonicToSeed } from "@src/background/services/mnemonic";
import SimpleStorage from "@src/background/services/storage";
import { InitializationStep } from "@src/types";

import type { KeyPair } from "./types";
import type { IBackupable } from "../backup";

const KEY_STORAGE_DB_KEY = "@KEY-STORAGE@";

export default class KeyStorageService implements IBackupable {
  private static INSTANCE: KeyStorageService;

  private keyStorage: SimpleStorage;

  private lockService: LockerService;

  private miscStorage: MiscStorageService;

  private constructor() {
    this.keyStorage = new SimpleStorage(KEY_STORAGE_DB_KEY);
    this.lockService = LockerService.getInstance();
    this.miscStorage = MiscStorageService.getInstance();
  }

  static getInstance = (): KeyStorageService => {
    if (!KeyStorageService.INSTANCE) {
      KeyStorageService.INSTANCE = new KeyStorageService();
    }

    return KeyStorageService.INSTANCE;
  };

  generateKeyPair = async (mnemonic: string): Promise<void> => {
    const seed = await mnemonicToSeed(mnemonic);
    nacl.setPRNG(() => toUtf8Bytes(seed));

    const randomBytes = nacl.randomBytes(32);
    const { publicKey, secretKey } = nacl.sign.keyPair.fromSeed(randomBytes);

    const serializedKeys = JSON.stringify({
      publicKey: util.encodeBase64(publicKey),
      secretKey: util.encodeBase64(secretKey),
    });
    const encrypted = this.lockService.encrypt(serializedKeys);
    await this.keyStorage.set(encrypted);
    await this.miscStorage.setInitialization({ initializationStep: InitializationStep.MNEMONIC });
  };

  signMessage = async (messageHex: string): Promise<string> => {
    const encrypted = await this.keyStorage.get<string>();

    if (!encrypted) {
      throw new Error("No key pair available");
    }

    const { secretKey } = JSON.parse(this.lockService.decrypt(encrypted)) as KeyPair;

    return hexlify(nacl.sign(toUtf8Bytes(messageHex), util.decodeBase64(secretKey)));
  };

  clear = async (): Promise<void> => {
    await this.keyStorage.clear();
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.keyStorage.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    return cryptoGenerateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    const { isNewOnboarding } = await this.lockService.isAuthentic(backupPassword, Boolean(backupEncryptedData));

    if (isNewOnboarding && backupEncryptedData) {
      const authenticBackupCiphertext = cryptoGetAuthenticBackupCiphertext(backupEncryptedData, backupPassword);
      await this.keyStorage.set(authenticBackupCiphertext);
    }
  };
}
