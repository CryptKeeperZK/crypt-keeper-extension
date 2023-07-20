import { AES, enc, HmacSHA256, SHA256 } from "crypto-js";

import { validateMnemonic } from "@src/background/services/mnemonic";

import { ECryptMode, ICryptoServiceArgs, IDecryptArgs, IEncryptArgs } from "./types";

export default class CryptoService {
  private static INSTANCE: CryptoService;

  private secrets: Record<ECryptMode, string | undefined> = {
    [ECryptMode.PASSWORD]: undefined,
    [ECryptMode.MNEMONIC]: undefined,
  };

  private constructor({ password, mnemonic }: ICryptoServiceArgs) {
    this.secrets[ECryptMode.PASSWORD] = password;
    this.secrets[ECryptMode.MNEMONIC] = mnemonic;
  }

  static getInstance(args: ICryptoServiceArgs = {}): CryptoService {
    if (!CryptoService.INSTANCE) {
      CryptoService.INSTANCE = new CryptoService(args);
    }

    return CryptoService.INSTANCE;
  }

  setPassword(password: string): CryptoService {
    this.secrets[ECryptMode.PASSWORD] = password;

    return this;
  }

  setMnemonic(mnemonic: string): CryptoService {
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Mnemonic is invalid");
    }

    this.secrets[ECryptMode.MNEMONIC] = mnemonic;

    return this;
  }

  isAuthenticPassword(password: string): boolean {
    if (this.secrets[ECryptMode.PASSWORD] !== password) {
      throw new Error("Password doesn't match with current");
    }

    return true;
  }

  clear(): void {
    this.secrets = {
      [ECryptMode.PASSWORD]: undefined,
      [ECryptMode.MNEMONIC]: undefined,
    };
  }

  encrypt(text: string, { secret, mode = ECryptMode.PASSWORD }: IEncryptArgs = {}): string {
    const encryptionKey = secret || this.secrets[mode];
    this.checkSecretInitialized(encryptionKey);

    return AES.encrypt(text, encryptionKey!).toString();
  }

  decrypt(ciphertext: string, { secret, mode = ECryptMode.PASSWORD }: IDecryptArgs = {}): string {
    const encryptionKey = secret || this.secrets[mode];
    this.checkSecretInitialized(encryptionKey);

    const bytes = AES.decrypt(ciphertext, encryptionKey!);
    return bytes.toString(enc.Utf8);
  }

  generateEncryptedHmac(ciphertext: string, password: string): string {
    this.checkSecretInitialized(password);
    this.isAuthenticPassword(password);

    const hmac = this.generateHmac(ciphertext, password);
    return `${hmac}${ciphertext}`;
  }

  getAuthenticCiphertext(ciphertext: string, password: string): string {
    this.checkSecretInitialized(password);

    const transitHmac = ciphertext.substring(0, 64);
    const transitCipherContent = ciphertext.substring(64);
    const decryptedHmac = this.generateHmac(transitCipherContent, password);
    const isAuthentic = transitHmac === decryptedHmac;

    if (!isAuthentic) {
      throw new Error("This ciphertext is not authentic");
    }

    return transitCipherContent;
  }

  private generateHmac(ciphertext: string, password: string): string {
    return HmacSHA256(ciphertext, SHA256(password)).toString();
  }

  private checkSecretInitialized(secret?: string): void {
    if (!secret) {
      throw new Error("Password is not provided");
    }
  }
}
