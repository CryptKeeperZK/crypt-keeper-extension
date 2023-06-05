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
  ConnectedIdentityData,
  EWallet,
  IdentityHost,
  IdentityMetadata,
  IdentityName,
  NewIdentityRequest,
  OperationType,
  SelectedIdentity,
} from "@src/types";
import {
  setConnectedCommitment,
  setIdentities,
  setIdentityHost,
  setSelectedCommitment,
} from "@src/ui/ducks/identities";
import { ellipsify } from "@src/util/account";
import pushMessage from "@src/util/pushMessage";

import type { IBackupable } from "@src/background/services/backup";

import { createNewIdentity } from "./factory";

const IDENTITY_KEY = "@@ID@@";
const ACTIVE_IDENTITY_KEY = "@@AID@@";
const CONNECTED_IDENTITY_KEY = "@@AID@@";

export default class ZkIdentityService implements IBackupable {
  private static INSTANCE: ZkIdentityService;

  private identitiesStore: SimpleStorage;

  private activeIdentityStore: SimpleStorage;

  private connectedIdentityStore: SimpleStorage;

  private lockService: LockerService;

  private notificationService: NotificationService;

  private historyService: HistoryService;

  private browserController: BrowserUtils;

  private walletService: WalletService;

  private activeIdentity?: ZkIdentitySemaphore;

  private connectedIdentity?: ZkIdentitySemaphore;

  private constructor() {
    this.activeIdentity = undefined;
    this.connectedIdentity = undefined;
    this.identitiesStore = new SimpleStorage(IDENTITY_KEY);
    this.activeIdentityStore = new SimpleStorage(ACTIVE_IDENTITY_KEY);
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

  getActiveIdentityData = async (): Promise<SelectedIdentity> => {
    const identity = await this.getActiveIdentity();

    return {
      commitment: identity ? bigintToHex(identity.genIdentityCommitment()) : "",
      web2Provider: identity?.metadata.web2Provider || "",
    };
  };

  getActiveIdentity = async (): Promise<ZkIdentitySemaphore | undefined> => {
    const activeIdentityCommitmentCipher = await this.activeIdentityStore.get<string>();

    if (!activeIdentityCommitmentCipher) {
      return undefined;
    }

    const activeIdentityCommitment = this.lockService.decrypt(activeIdentityCommitmentCipher);
    const identities = await this.getIdentitiesFromStore();
    const identity = identities.get(activeIdentityCommitment);

    if (!identity) {
      return undefined;
    }

    this.activeIdentity = ZkIdentitySemaphore.genFromSerialized(identity);

    return this.activeIdentity;
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

  getConnectedIdentityData = async (): Promise<ConnectedIdentityData> => {
    const identity = await this.getConnectedIdentity();

    if (!identity) {
      throw new Error("This identity doesn't exist!");
    }

    const identityCommitment = bigintToHex(identity.genIdentityCommitment());
    const host = identity?.metadata.host;

    if (!host) {
      throw new Error("This host is not connected to this host");
    }

    return {
      identityCommitment,
      host,
      groups: [],
    };
  };

  getConnectedIdentity = async (): Promise<ZkIdentitySemaphore | undefined> => {
    const activeIdentityCommitmentCipher = await this.connectedIdentityStore.get<string>();

    if (!activeIdentityCommitmentCipher) {
      return undefined;
    }

    const activeIdentityCommitment = this.lockService.decrypt(activeIdentityCommitmentCipher);
    const identities = await this.getIdentitiesFromStore();
    const identity = identities.get(activeIdentityCommitment);

    if (!identity) {
      return undefined;
    }

    this.connectedIdentity = ZkIdentitySemaphore.genFromSerialized(identity);

    return this.connectedIdentity;
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

  getHostIdentitis = async ({
    host,
  }: {
    host: string;
  }): Promise<{ commitment: string; metadata: IdentityMetadata }[]> => {
    const identitis = await this.getIdentities();

    return identitis.filter((identity) => identity.metadata.host === host);
  };

  getRandomIdentitis = async (): Promise<{ commitment: string; metadata: IdentityMetadata }[]> => {
    const identitis = await this.getIdentities();

    return identitis.filter((identity) => identity.metadata.host === undefined);
  };

  getNumOfIdentites = async (): Promise<number> => {
    const identities = await this.getIdentitiesFromStore();
    return identities.size;
  };

  setActiveIdentity = async ({ identityCommitment }: { identityCommitment: string }): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    return this.updateActiveIdentity({ identities, identityCommitment });
  };

  private updateActiveIdentity = async ({
    identities,
    identityCommitment,
  }: {
    identities: Map<string, string>;
    identityCommitment: string;
  }): Promise<boolean> => {
    const identity = identities.get(identityCommitment);

    if (!identity) {
      return false;
    }

    this.activeIdentity = ZkIdentitySemaphore.genFromSerialized(identity);

    const activeIdentityWeb2Provider = this.activeIdentity.metadata.web2Provider;

    await this.writeActiveIdentity(identityCommitment, activeIdentityWeb2Provider);

    return true;
  };

  private writeActiveIdentity = async (commitment: string, web2Provider?: string): Promise<void> => {
    const ciphertext = this.lockService.encrypt(commitment);
    await this.activeIdentityStore.set(ciphertext);

    const [tabs] = await Promise.all([
      browser.tabs.query({ active: true }),
      pushMessage(
        setSelectedCommitment({
          commitment,
          web2Provider,
        }),
      ),
    ]);

    await Promise.all(
      tabs.map((tab) =>
        browser.tabs
          .sendMessage(
            tab.id as number,
            setSelectedCommitment({
              commitment,
              web2Provider,
            }),
          )
          .catch(() => undefined),
      ),
    );
  };

  setConnectedIdentity = async ({
    identityCommitment,
    host,
  }: {
    identityCommitment: string;
    host: string;
  }): Promise<boolean> => {
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
    host: string;
  }): Promise<boolean> => {
    const identity = identities.get(identityCommitment);

    if (!identity) {
      return false;
    }

    this.connectedIdentity = ZkIdentitySemaphore.genFromSerialized(identity);

    const storedIdentityHost = this.connectedIdentity.metadata.host;

    // Update connected identity host
    if (!storedIdentityHost) {
      await this.updateIdentityHost({ identityCommitment, host });
    }

    await this.writeConnectedIdentity(identityCommitment, host);

    return true;
  };

  private updateIdentityHost = async ({ identityCommitment, host }: IdentityHost): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const rawIdentity = identities.get(identityCommitment);

    if (!rawIdentity) {
      return false;
    }

    const identity = ZkIdentitySemaphore.genFromSerialized(rawIdentity);
    identity.setIdentityMetadataHost(host);
    identities.set(identityCommitment, identity.serialize());
    await this.writeIdentities(identities);
    await this.refresh();

    return true;
  };

  private writeConnectedIdentity = async (commitment: string, host?: string): Promise<void> => {
    const ciphertext = this.lockService.encrypt(commitment);
    await this.connectedIdentityStore.set(ciphertext);
    await pushMessage(
      setConnectedCommitment({
        commitment,
        host,
      }),
    );
  };

  // TODO: this should be more genaric to be updateIdentity()
  updateIdentityName = async (payload: IdentityName): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const { identityCommitment, name } = payload;
    const rawIdentity = identities.get(identityCommitment);

    if (!rawIdentity) {
      return false;
    }

    const identity = ZkIdentitySemaphore.genFromSerialized(rawIdentity);
    identity.setIdentityMetadataName(name);
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
      await this.clearActiveIdentity();
      return;
    }

    const identity = identities.keys().next();
    await this.updateActiveIdentity({ identities, identityCommitment: identity.value as string });
  };

  private clearActiveIdentity = async (): Promise<void> => {
    if (!this.activeIdentity) {
      return;
    }

    this.activeIdentity = undefined;
    await this.writeActiveIdentity("", "");
  };

  setIdentityHost = async ({ host }: { host: string }): Promise<void> => {
    if (host) {
      await pushMessage(setIdentityHost(host));
    }
  };

  createIdentityRequest = async (): Promise<void> => {
    await this.browserController.openPopup({ params: { redirect: Paths.CREATE_IDENTITY } });
  };

  createIdentity = async ({
    strategy,
    walletType,
    messageSignature,
    options,
    host,
  }: NewIdentityRequest): Promise<string | undefined> => {
    if (walletType === EWallet.ETH_WALLET && !messageSignature) {
      throw new Error("No signature provided");
    }

    const numOfIdentites = await this.getNumOfIdentites();

    const config = {
      ...options,
      identityStrategy: strategy,
      name: options?.name || `Account ${numOfIdentites}`,
      messageSignature: strategy === "interrep" ? messageSignature : undefined,
      host,
      groups: [], // Groups would be empty first because its still a new identity
    };

    if (walletType === EWallet.CRYPT_KEEPER_WALLET && strategy === "interrep") {
      config.messageSignature = await this.walletService.signMessage({
        message: options.message,
        address: options.account,
      });
    }

    const identity = createNewIdentity(strategy, config);
    const status = await this.insertIdentity(identity);

    const identityCommitment = status ? identity.genIdentityCommitment().toString() : undefined;

    // That means this is a creation from a connection request from a `host`
    if (host && identityCommitment) {
      await this.setConnectedIdentity({ identityCommitment, host });
      return identityCommitment;
    }

    await this.browserController.closePopup();

    return identityCommitment;
  };

  private insertIdentity = async (newIdentity: ZkIdentitySemaphore): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const identityCommitment = bigintToHex(newIdentity.genIdentityCommitment());

    if (identities.has(identityCommitment)) {
      return false;
    }

    identities.set(identityCommitment, newIdentity.serialize());
    await this.writeIdentities(identities);
    await this.updateActiveIdentity({ identities, identityCommitment });
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
    const activeIdentity = await this.getActiveIdentity();
    const identities = await this.getIdentitiesFromStore();
    const activeIdentityCommitment = activeIdentity ? bigintToHex(activeIdentity?.genIdentityCommitment()) : undefined;
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

    if (activeIdentityCommitment === identityCommitment) {
      await this.setDefaultIdentity();
    }

    return true;
  };

  deleteAllIdentities = async (): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      return false;
    }

    await Promise.all([this.clearActiveIdentity(), this.identitiesStore.clear(), pushMessage(setIdentities([]))]);
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
