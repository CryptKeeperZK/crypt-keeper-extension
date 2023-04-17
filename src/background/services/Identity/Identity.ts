import { bigintToHex } from "bigint-conversion";
import { browser } from "webextension-polyfill-ts";

import { HistoryService } from "@src/background/services/History";
import { LockService } from "@src/background/services/Lock";
import { NotificationService } from "@src/background/services/Notification";
import { SimpleStorageService } from "@src/background/services/Storage";
import { getEnabledFeatures } from "@src/config/features";
import { IdentityMetadata, IdentityName } from "@src/types";
import { SelectedIdentity, setIdentities, setSelectedCommitment } from "@src/ui/ducks/identities";
import { ellipsify } from "@src/util/account";
import pushMessage from "@src/util/pushMessage";

import { IdentityDecoraterService } from "./IdentityDecorater";

const IDENTITY_KEY = "@@ID@@";
const ACTIVE_IDENTITY_KEY = "@@AID@@";

export class IdentityService {
  private activeIdentity?: IdentityDecoraterService;

  private identitiesStore: SimpleStorageService;

  private activeIdentityStore: SimpleStorageService;

  private lockService: LockService;

  private notificationService: NotificationService;

  private historyService: HistoryService;

  public constructor() {
    this.activeIdentity = undefined;
    this.identitiesStore = new SimpleStorageService(IDENTITY_KEY);
    this.activeIdentityStore = new SimpleStorageService(ACTIVE_IDENTITY_KEY);
    this.lockService = LockService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.historyService = HistoryService.getInstance();
  }

  public unlock = async (): Promise<boolean> => {
    await this.setDefaultIdentity();

    return true;
  };

  public setActiveIdentity = async ({ identityCommitment }: { identityCommitment: string }): Promise<boolean> => {
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

    this.activeIdentity = IdentityDecoraterService.genFromSerialized(identity);

    const activeIdentityWeb2Provider = this.activeIdentity.metadata.web2Provider;

    await this.writeActiveIdentity(identityCommitment, activeIdentityWeb2Provider);

    return true;
  };

  public setIdentityName = async (payload: IdentityName): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const { identityCommitment, name } = payload;
    const rawIdentity = identities.get(identityCommitment);

    if (!rawIdentity) {
      return false;
    }

    const identity = IdentityDecoraterService.genFromSerialized(rawIdentity);
    identity.setIdentityMetadataName(name);
    identities.set(identityCommitment, identity.serialize());
    await this.writeIdentities(identities);
    await this.refresh();

    return true;
  };

  public deleteIdentity = async (payload: { identityCommitment: string }): Promise<boolean> => {
    const { identityCommitment } = payload;
    const activeIdentity = await this.getActiveIdentity();
    const identities = await this.getIdentitiesFromStore();
    const activeIdentityCommitment = activeIdentity ? bigintToHex(activeIdentity?.genIdentityCommitment()) : undefined;

    if (!identities.has(identityCommitment)) {
      return false;
    }

    identities.delete(identityCommitment);
    await this.writeIdentities(identities);

    await this.refresh();

    if (activeIdentityCommitment === identityCommitment) {
      await this.setDefaultIdentity();
    }

    return true;
  };

  public deleteAllIdentities = async (): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      return false;
    }

    await Promise.all([this.clearActiveIdentity(), this.identitiesStore.clear(), pushMessage(setIdentities([]))]);

    return true;
  };

  public getActiveIdentity = async (): Promise<IdentityDecoraterService | undefined> => {
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

    this.activeIdentity = IdentityDecoraterService.genFromSerialized(identity);

    return this.activeIdentity;
  };

  public getActiveIdentityData = async (): Promise<SelectedIdentity> => {
    const identity = await this.getActiveIdentity();

    return {
      commitment: identity ? bigintToHex(identity.genIdentityCommitment()) : "",
      web2Provider: identity?.metadata.web2Provider || "",
    };
  };

  public getIdentityCommitments = async (): Promise<{ commitments: string[]; identities: Map<string, string> }> => {
    const identities = await this.getIdentitiesFromStore();
    const commitments = [...identities.keys()];

    return { commitments, identities };
  };

  public getIdentities = async (): Promise<{ commitment: string; metadata: IdentityMetadata }[]> => {
    const { commitments, identities } = await this.getIdentityCommitments();

    return commitments
      .filter((commitment) => identities.has(commitment))
      .map((commitment) => {
        const serializedIdentity = identities.get(commitment) as string;
        const identity = IdentityDecoraterService.genFromSerialized(serializedIdentity);

        return {
          commitment,
          metadata: identity?.metadata,
        };
      });
  };

  public insert = async (newIdentity: IdentityDecoraterService): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const identityCommitment = bigintToHex(newIdentity.genIdentityCommitment());

    if (identities.has(identityCommitment)) {
      return false;
    }

    identities.set(identityCommitment, newIdentity.serialize());
    await this.writeIdentities(identities);
    await this.updateActiveIdentity({ identities, identityCommitment });

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

  public getNumOfIdentites = async (): Promise<number> => {
    const identities = await this.getIdentitiesFromStore();
    return identities.size;
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

  private writeIdentities = async (identities: Map<string, string>): Promise<void> => {
    const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
    const cipherText = this.lockService.encrypt(serializedIdentities);
    await this.identitiesStore.set(cipherText);
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
    );
  };

  private getIdentitiesFromStore = async (): Promise<Map<string, string>> => {
    const cipherText = await this.identitiesStore.get<string>();

    if (!cipherText) {
      return new Map();
    }

    const features = getEnabledFeatures();
    const identitesDecrypted = this.lockService.decrypt(cipherText);
    const iterableIdentities = JSON.parse(identitesDecrypted) as Iterable<readonly [string, string]>;

    return new Map(
      features.RANDOM_IDENTITY
        ? iterableIdentities
        : [...iterableIdentities].filter(
            ([, identity]) =>
              IdentityDecoraterService.genFromSerialized(identity).metadata.identityStrategy !== "random",
          ),
    );
  };

  private refresh = async (): Promise<void> => {
    const identities = await this.getIdentities();
    await pushMessage(setIdentities(identities));
  };
}
