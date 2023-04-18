import { bigintToHex } from "bigint-conversion";
import { browser } from "webextension-polyfill-ts";

import { BrowserController } from "@src/background/controllers/browser";
import { HistoryService } from "@src/background/services/history";
import { IdentityDecoraterService } from "@src/background/services/identity/services/IdentityDecorater";
import { IdentityFactoryService } from "@src/background/services/identity/services/IdentityFactory";
import { LockService } from "@src/background/services/lock";
import { NotificationService } from "@src/background/services/notification";
import { SimpleStorageService } from "@src/background/services/storage";
import { getEnabledFeatures } from "@src/config/features";
import { Paths } from "@src/constants";
import { IdentityMetadata, IdentityName, NewIdentityRequest } from "@src/types";
import { SelectedIdentity, setIdentities, setSelectedCommitment } from "@src/ui/ducks/identities";
import { ellipsify } from "@src/util/account";
import pushMessage from "@src/util/pushMessage";

const IDENTITY_KEY = "@@ID@@";
const ACTIVE_IDENTITY_KEY = "@@AID@@";

export class IdentityService extends IdentityFactoryService {
  private activeIdentity?: IdentityDecoraterService;

  private identitiesStore: SimpleStorageService;

  private activeIdentityStore: SimpleStorageService;

  private lockService: LockService;

  private notificationService: NotificationService;

  private historyService: HistoryService;

  private browsercontroller: BrowserController;

  public constructor() {
    super();
    this.activeIdentity = undefined;
    this.identitiesStore = new SimpleStorageService(IDENTITY_KEY);
    this.activeIdentityStore = new SimpleStorageService(ACTIVE_IDENTITY_KEY);
    this.lockService = LockService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.browsercontroller = BrowserController.getInstance();
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

  public createIdentityRequest = async (): Promise<void> => {
    await this.browsercontroller.openPopup({ params: { redirect: Paths.CREATE_IDENTITY } });
  };

  public createIdentity = async ({
    strategy,
    messageSignature,
    options,
  }: NewIdentityRequest): Promise<{ status: boolean; identityCommitment?: bigint }> => {
    if (!strategy) {
      throw new Error("strategy not provided");
    }

    const numOfIdentites = await this.getNumOfIdentites();

    const config = {
      ...options,
      account: options.account ?? "",
      identityStrategy: strategy,
      name: options?.name || `Account # ${numOfIdentites}`,
      messageSignature: strategy === "interrep" ? messageSignature : undefined,
    };

    const identity = this.createNewIdentity(strategy, config);

    if (!identity) {
      throw new Error("Identity not created, make sure to check strategy");
    }

    const status = await this.insertIdentity(identity);

    await this.browsercontroller.closePopup();

    return {
      status,
      identityCommitment: identity.genIdentityCommitment(),
    };
  };

  private insertIdentity = async (newIdentity: IdentityDecoraterService): Promise<boolean> => {
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
