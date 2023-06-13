import { bigintToHex } from "bigint-conversion";
import { browser } from "webextension-polyfill-ts";

import BrowserUtils from "@src/background/controllers/browserUtils";
import { cryptoGenerateEncryptedHmac, cryptoGetAuthenticBackupCiphertext } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import LockerService from "@src/background/services/lock";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import WalletService from "@src/background/services/wallet";
import { ZkIdentitySemaphore } from "@src/background/services/zkIdentity/protocols/ZkIdentitySemaphore";
import { getEnabledFeatures } from "@src/config/features";
import { Paths } from "@src/constants";
import {
  EWallet,
  IdentityMetadata,
  SetIdentityNameArgs,
  NewIdentityRequest,
  OperationType,
  ConnectedIdentity,
  SetIdentityHostArgs,
  ConnectIdentityArgs,
  ICreateIdentityRequestArgs,
} from "@src/types";
import { setIdentities, setConnectedIdentity } from "@src/ui/ducks/identities";
import { ellipsify } from "@src/util/account";
import pushMessage from "@src/util/pushMessage";

import type { IBackupable } from "@src/background/services/backup";

import { createNewIdentity } from "./factory";

const IDENTITY_KEY = "@@ID@@";
const CONNECTED_IDENTITY_KEY = "@@CONNECTED-IDENTITY@@";

export default class ZkIdentityService implements IBackupable {
  private static INSTANCE: ZkIdentityService;

  private identitiesStore: SimpleStorage;

  private connectedIdentityStore: SimpleStorage;

  private lockService: LockerService;

  private notificationService: NotificationService;

  private historyService: HistoryService;

  private browserController: BrowserUtils;

  private walletService: WalletService;

  private connectedIdentity?: ZkIdentitySemaphore;

  private constructor() {
    this.connectedIdentity = undefined;
    this.identitiesStore = new SimpleStorage(IDENTITY_KEY);
    this.connectedIdentityStore = new SimpleStorage(CONNECTED_IDENTITY_KEY);
    this.lockService = LockerService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.browserController = BrowserUtils.getInstance();
    this.walletService = WalletService.getInstance();
  }

  static getInstance = (): ZkIdentityService => {
    if (!ZkIdentityService.INSTANCE) {
      ZkIdentityService.INSTANCE = new ZkIdentityService();
    }

    return ZkIdentityService.INSTANCE;
  };

  getConnectedIdentityData = async (): Promise<ConnectedIdentity> => {
    const identity = await this.getConnectedIdentity();

    return {
      commitment: identity ? bigintToHex(identity.genIdentityCommitment()) : "",
      web2Provider: identity?.metadata.web2Provider || "",
      host: identity?.metadata.host || "",
    };
  };

  getConnectedIdentity = async (): Promise<ZkIdentitySemaphore | undefined> => {
    const connectedIdentityCommitmentCipher = await this.connectedIdentityStore.get<string>();

    if (!connectedIdentityCommitmentCipher) {
      return undefined;
    }

    const connectedIdentityCommitment = this.lockService.decrypt(connectedIdentityCommitmentCipher);
    const identities = await this.getIdentitiesFromStore();
    const identity = identities.get(connectedIdentityCommitment);

    if (!identity) {
      return undefined;
    }

    this.connectedIdentity = ZkIdentitySemaphore.genFromSerialized(identity);

    return this.connectedIdentity;
  };

  private getIdentitiesFromStore = async (): Promise<Map<string, string>> => {
    const ciphertext = await this.identitiesStore.get<string>();

    if (!ciphertext) {
      return new Map();
    }

    const features = getEnabledFeatures();
    const identitesDecrypted = this.lockService.decrypt(ciphertext);
    const iterableIdentities = JSON.parse(identitesDecrypted) as Iterable<readonly [string, string]>;

    return new Map(
      features.INTERREP_IDENTITY
        ? iterableIdentities
        : [...iterableIdentities].filter(
            ([, identity]) => ZkIdentitySemaphore.genFromSerialized(identity).metadata.identityStrategy !== "interrep",
          ),
    );
  };

  getIdentityCommitments = async (): Promise<{ commitments: string[]; identities: Map<string, string> }> => {
    const identities = await this.getIdentitiesFromStore();
    const commitments = [...identities.keys()];

    return { commitments, identities };
  };

  getIdentities = async (): Promise<{ commitment: string; metadata: IdentityMetadata }[]> => {
    const { commitments, identities } = await this.getIdentityCommitments();

    return commitments
      .filter((commitment) => identities.has(commitment))
      .map((commitment) => {
        const serializedIdentity = identities.get(commitment) as string;
        const identity = ZkIdentitySemaphore.genFromSerialized(serializedIdentity);

        return {
          commitment,
          metadata: identity?.metadata,
        };
      });
  };

  getNumOfIdentites = async (): Promise<number> => {
    const identities = await this.getIdentitiesFromStore();
    return identities.size;
  };

  connectIdentity = async ({ host, identityCommitment }: ConnectIdentityArgs): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    return this.updateConnectedIdentity({ identities, identityCommitment, host });
  };

  private updateConnectedIdentity = async ({
    identities,
    identityCommitment,
    host,
  }: {
    identities: Map<string, string>;
    identityCommitment: string;
    host?: string;
  }): Promise<boolean> => {
    const identity = identities.get(identityCommitment);

    if (!identity) {
      return false;
    }

    this.connectedIdentity = ZkIdentitySemaphore.genFromSerialized(identity);
    this.connectedIdentity.updateMetadata({ host });
    await this.writeConnectedIdentity(identityCommitment, this.connectedIdentity.metadata);

    return true;
  };

  private writeConnectedIdentity = async (commitment: string, metadata?: IdentityMetadata): Promise<void> => {
    const ciphertext = this.lockService.encrypt(commitment);
    await this.connectedIdentityStore.set(ciphertext);

    const [tabs] = await Promise.all([
      browser.tabs.query({ active: true }),
      pushMessage(
        setConnectedIdentity({
          commitment,
          web2Provider: metadata?.web2Provider,
          host: metadata?.host,
        }),
      ),
    ]);

    await Promise.all(
      tabs.map((tab) =>
        browser.tabs
          .sendMessage(
            tab.id as number,
            setConnectedIdentity({
              commitment,
              web2Provider: metadata?.web2Provider,
              host: metadata?.host,
            }),
          )
          .catch(() => undefined),
      ),
    );
  };

  setIdentityName = async ({ identityCommitment, name }: SetIdentityNameArgs): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const rawIdentity = identities.get(identityCommitment);

    if (!rawIdentity) {
      return false;
    }

    const identity = ZkIdentitySemaphore.genFromSerialized(rawIdentity);
    identity.updateMetadata({ name });
    identities.set(identityCommitment, identity.serialize());
    await this.writeIdentities(identities);
    await this.refresh();

    return true;
  };

  setIdentityHost = async ({ identityCommitment, host }: SetIdentityHostArgs): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const rawIdentity = identities.get(identityCommitment);

    if (!rawIdentity) {
      return false;
    }

    const identity = ZkIdentitySemaphore.genFromSerialized(rawIdentity);
    identity.updateMetadata({ host });
    identities.set(identityCommitment, identity.serialize());
    await this.writeIdentities(identities);
    await this.refresh();

    return true;
  };

  unlock = async (): Promise<boolean> => {
    await this.setDefaultIdentity();

    return true;
  };

  private setDefaultIdentity = async (): Promise<void> => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      await this.clearConnectedIdentity();
      return;
    }

    const identity = identities.keys().next();

    await this.updateConnectedIdentity({
      identities,
      identityCommitment: identity.value as string,
    });
  };

  private clearConnectedIdentity = async (): Promise<void> => {
    if (!this.connectedIdentity) {
      return;
    }

    this.connectedIdentity = undefined;
    await this.writeConnectedIdentity("");
  };

  createIdentityRequest = async ({ host }: ICreateIdentityRequestArgs): Promise<void> => {
    await this.browserController.openPopup({ params: { redirect: Paths.CREATE_IDENTITY, host } });
  };

  createIdentity = async ({
    strategy,
    walletType,
    messageSignature,
    groups,
    host,
    options,
  }: NewIdentityRequest): Promise<string | undefined> => {
    if (walletType === EWallet.ETH_WALLET && !messageSignature) {
      throw new Error("No signature provided");
    }

    const numOfIdentites = await this.getNumOfIdentites();

    const config = {
      ...options,
      groups,
      host,
      identityStrategy: strategy,
      name: options?.name || `Account # ${numOfIdentites}`,
      messageSignature: strategy === "interrep" ? messageSignature : undefined,
    };

    if (walletType === EWallet.CRYPT_KEEPER_WALLET && strategy === "interrep") {
      config.messageSignature = await this.walletService.signMessage({
        message: options.message,
        address: options.account,
      });
    }

    const identity = createNewIdentity(strategy, config);
    const status = await this.insertIdentity(identity);

    if (!status) {
      throw new Error("Identity is already exist. Try to change nonce or identity data.");
    }

    return identity.genIdentityCommitment().toString();
  };

  private insertIdentity = async (newIdentity: ZkIdentitySemaphore): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const identityCommitment = bigintToHex(newIdentity.genIdentityCommitment());

    if (identities.has(identityCommitment)) {
      return false;
    }

    identities.set(identityCommitment, newIdentity.serialize());
    await this.writeIdentities(identities);
    await this.updateConnectedIdentity({ identities, identityCommitment, host: newIdentity.metadata.host });
    await this.refresh();
    await this.historyService.trackOperation(OperationType.CREATE_IDENTITY, {
      identity: { commitment: identityCommitment, metadata: newIdentity.metadata },
    });

    await this.notificationService.create({
      options: {
        title: "New identity has been created.",
        message: `Identity commitment: ${ellipsify(identityCommitment)}`,
        iconUrl: browser.runtime.getURL("/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  private writeIdentities = async (identities: Map<string, string>): Promise<void> => {
    const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
    const ciphertext = this.lockService.encrypt(serializedIdentities);
    await this.identitiesStore.set(ciphertext);
  };

  private refresh = async (): Promise<void> => {
    const identities = await this.getIdentities();
    await pushMessage(setIdentities(identities));
  };

  deleteIdentity = async (payload: { identityCommitment: string }): Promise<boolean> => {
    const { identityCommitment } = payload;
    const connectedIdentity = await this.getConnectedIdentity();
    const identities = await this.getIdentitiesFromStore();
    const connectedIdentityCommitment = connectedIdentity
      ? bigintToHex(connectedIdentity?.genIdentityCommitment())
      : undefined;
    const identity = identities.get(identityCommitment);

    if (!identity) {
      return false;
    }

    identities.delete(identityCommitment);
    await this.writeIdentities(identities);
    await this.historyService.trackOperation(OperationType.DELETE_IDENTITY, {
      identity: {
        commitment: identityCommitment,
        metadata: ZkIdentitySemaphore.genFromSerialized(identity).metadata,
      },
    });

    await this.refresh();

    if (connectedIdentityCommitment === identityCommitment) {
      await this.setDefaultIdentity();
    }

    return true;
  };

  deleteAllIdentities = async (): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      return false;
    }

    await Promise.all([this.clearConnectedIdentity(), this.identitiesStore.clear(), pushMessage(setIdentities([]))]);
    await this.historyService.trackOperation(OperationType.DELETE_ALL_IDENTITIES, {});

    await this.notificationService.create({
      options: {
        title: "Identities removed",
        message: `Identity storage has been cleared`,
        iconUrl: browser.runtime.getURL("/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.identitiesStore.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    return cryptoGenerateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    if (!backupEncryptedData) {
      return;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    await this.identitiesStore.set<string>(cryptoGetAuthenticBackupCiphertext(backupEncryptedData, backupPassword));
  };
}
