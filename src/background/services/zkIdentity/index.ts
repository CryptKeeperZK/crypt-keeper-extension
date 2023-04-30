import { bigintToHex } from "bigint-conversion";
import { browser } from "webextension-polyfill-ts";

import BrowserUtils from "@src/background/controllers/browserUtils";
import { ZkIdentitySemaphore } from "@src/background/services/zkIdentity/protocols/ZkIdentitySemaphore";
import { getEnabledFeatures } from "@src/config/features";
import { Paths } from "@src/constants";
import { IdentityMetadata, IdentityName, NewIdentityRequest, OperationType } from "@src/types";
import { SelectedIdentity, setIdentities, setSelectedCommitment } from "@src/ui/ducks/identities";
import { ellipsify } from "@src/util/account";
import pushMessage from "@src/util/pushMessage";

import type { IBackupable } from "../backup";

import HistoryService from "../history";
import LockerService from "../locker";
import NotificationService from "../notification";
import SimpleStorage from "../storage";

import { createNewIdentity } from "./factory";

const IDENTITY_KEY = "@@ID@@";
const ACTIVE_IDENTITY_KEY = "@@AID@@";

export default class ZkIdentityService implements IBackupable {
  private static INSTANCE: ZkIdentityService;

  private identitiesStore: SimpleStorage;

  private activeIdentityStore: SimpleStorage;

  private lockService: LockerService;

  private notificationService: NotificationService;

  private historyService: HistoryService;

  private browserController: BrowserUtils;

  private activeIdentity?: ZkIdentitySemaphore;

  private constructor() {
    this.activeIdentity = undefined;
    this.identitiesStore = new SimpleStorage(IDENTITY_KEY);
    this.activeIdentityStore = new SimpleStorage(ACTIVE_IDENTITY_KEY);
    this.lockService = LockerService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.browserController = BrowserUtils.getInstance();
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
    const features = getEnabledFeatures();
    const identitesDecrypted = await this.getDecryptedStore(this.identitiesStore);
    if (!identitesDecrypted) return new Map();
    const iterableIdentities = JSON.parse(identitesDecrypted) as Iterable<readonly [string, string]>;

    return new Map(
      features.RANDOM_IDENTITY
        ? iterableIdentities
        : [...iterableIdentities].filter(
            ([, identity]) => ZkIdentitySemaphore.genFromSerialized(identity).metadata.identityStrategy !== "random",
          ),
    );
  };

  private getDecryptedStore = async (store: SimpleStorage): Promise<string | null> => {
    const cipherText = await store.get<string>();

    if (!cipherText) return null;

    return this.lockService.decrypt(cipherText);
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
    const cipherText = this.lockService.encrypt(commitment);
    await this.activeIdentityStore.set(cipherText);

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

  setIdentityName = async (payload: IdentityName): Promise<boolean> => {
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

  createIdentityRequest = async (): Promise<void> => {
    await this.browserController.openPopup({ params: { redirect: Paths.CREATE_IDENTITY } });
  };

  createIdentity = async ({
    strategy,
    messageSignature,
    options,
  }: NewIdentityRequest): Promise<{ status: boolean; identityCommitment?: bigint }> => {
    const numOfIdentites = await this.getNumOfIdentites();

    const config = {
      ...options,
      account: options.account ?? "",
      identityStrategy: strategy,
      name: options?.name || `Account # ${numOfIdentites}`,
      messageSignature: strategy === "interrep" ? messageSignature : undefined,
    };

    const identity = createNewIdentity(strategy, config);
    const status = await this.insertIdentity(identity);
    await this.browserController.closePopup();

    return {
      status,
      identityCommitment: identity.genIdentityCommitment(),
    };
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
    const cipherText = this.lockService.encrypt(serializedIdentities);
    await this.identitiesStore.set(cipherText);
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

  downloadDecryptedStorage = async (): Promise<string | null> => {
    return await this.getDecryptedStore(this.identitiesStore);
  };

  uploadDecryptedStorage = async (decrypted: string): Promise<void> => {
    const ciphertext = this.lockService.encrypt(decrypted);
    await this.identitiesStore.set<string>(ciphertext);
  };
}
