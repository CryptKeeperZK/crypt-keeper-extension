import { bigintToHex } from "bigint-conversion";
import { browser } from "webextension-polyfill-ts";

import { IdentityMetadata, IdentityName } from "@src/types";
import { setIdentities, setSelected } from "@src/ui/ducks/identities";
import { ellipsify } from "@src/util/account";
import pushMessage from "@src/util/pushMessage";

import ZkIdentityDecorater from "../identityDecorater";

import LockService from "./lock";
import NotificationService from "./notification";
import SimpleStorage from "./simpleStorage";

const IDENTITY_KEY = "@@ID@@";
const ACTIVE_IDENTITY_KEY = "@@AID@@";

export default class IdentityService {
  private activeIdentity?: ZkIdentityDecorater;

  private identitiesStore: SimpleStorage;

  private activeIdentityStore: SimpleStorage;

  private lockService: LockService;

  private notificationService: NotificationService;

  constructor() {
    this.activeIdentity = undefined;
    this.identitiesStore = new SimpleStorage(IDENTITY_KEY);
    this.activeIdentityStore = new SimpleStorage(ACTIVE_IDENTITY_KEY);
    this.lockService = LockService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public unlock = async (): Promise<boolean> => {
    await this.setDefaultIdentity();

    return true;
  };

  public setActiveIdentity = async (identityCommitment: string): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const identity = identities.get(identityCommitment);

    if (!identity) {
      return false;
    }

    this.activeIdentity = ZkIdentityDecorater.genFromSerialized(identity);
    await this.writeActiveIdentity(identityCommitment);

    return true;
  };

  public setIdentityName = async (payload: IdentityName): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const { identityCommitment, name } = payload;
    const rawIdentity = identities.get(identityCommitment);

    if (!rawIdentity) {
      return false;
    }

    const identity = ZkIdentityDecorater.genFromSerialized(rawIdentity);
    identity.setIdentityMetadataName(name);
    identities.set(identityCommitment, identity.serialize());
    await this.writeIdentities(identities);
    await this.refresh();

    return true;
  };

  public deleteIdentity = async (payload: { identityCommitment: string }): Promise<boolean> => {
    const { identityCommitment } = payload;
    const identities = await this.getIdentitiesFromStore();

    if (!identities.has(identityCommitment)) {
      return false;
    }

    identities.delete(identityCommitment);
    await this.writeIdentities(identities);

    await this.setDefaultIdentity();
    await this.refresh();

    return true;
  };

  public deleteAllIdentities = async (): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      return false;
    }

    await Promise.all([pushMessage(setIdentities([])), this.clearActiveIdentity(), this.identitiesStore.clear()]);

    return true;
  };

  public getActiveIdentity = async (): Promise<ZkIdentityDecorater | undefined> => {
    const acitveIdentityCommitmentCipher = await this.activeIdentityStore.get<string>();

    if (!acitveIdentityCommitmentCipher) {
      return undefined;
    }

    const activeIdentityCommitment = this.lockService.decrypt(acitveIdentityCommitmentCipher);
    const identities = await this.getIdentitiesFromStore();
    const identity = identities.get(activeIdentityCommitment);

    if (!identity) {
      return undefined;
    }

    this.activeIdentity = ZkIdentityDecorater.genFromSerialized(identity);

    pushMessage(
      setSelected(this.activeIdentity ? bigintToHex(this.activeIdentity.genIdentityCommitment()) : undefined),
    );

    return this.activeIdentity;
  };

  public getIdentityCommitments = async (): Promise<{ commitments: string[]; identities: Map<string, string> }> => {
    const identities = await this.getIdentitiesFromStore();
    const commitments = [...identities.keys()];

    return { commitments, identities };
  };

  public getIdentities = async (): Promise<{ 
    commitment: string;
    metadata: IdentityMetadata  
  }[]> => {
    const { commitments, identities } = await this.getIdentityCommitments();

    const identitiesMapped = commitments
      .filter((commitment) => identities.has(commitment))
      .map((commitment) => {
        const serializedIdentity = identities.get(commitment) as string;
        const identity = ZkIdentityDecorater.genFromSerialized(serializedIdentity);

        return {
          commitment,
          metadata: identity?.metadata,
        };
      });

    pushMessage(setIdentities(identitiesMapped));

    return identitiesMapped;
  };

  public insert = async (newIdentity: ZkIdentityDecorater): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const identityCommitment = bigintToHex(newIdentity.genIdentityCommitment());

    if (identities.has(identityCommitment)) {
      return false;
    }

    identities.set(identityCommitment, newIdentity.serialize());
    await this.writeIdentities(identities);

    await this.notificationService.create({
      options: {
        title: "New identity has been created.",
        message: `Identity commitment: ${ellipsify(identityCommitment)}`,
        iconUrl: browser.runtime.getURL("/logo.png"),
        type: "basic",
      },
    });

    await this.setActiveIdentity(identityCommitment);
    await this.refresh();

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
    await this.setActiveIdentity(identity.value as string);
  };

  private clearActiveIdentity = async (): Promise<void> => {
    if (!this.activeIdentity) {
      return;
    }

    this.activeIdentity = undefined;
    await this.writeActiveIdentity("");
  };

  private writeIdentities = async (identities: Map<string, string>): Promise<void> => {
    const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
    const cipherText = this.lockService.encrypt(serializedIdentities);
    await this.identitiesStore.set(cipherText);
  };

  private writeActiveIdentity = async (commitment: string): Promise<void> => {
    const cipherText = this.lockService.encrypt(commitment);
    await this.activeIdentityStore.set(cipherText);
    await pushMessage(setSelected(commitment));

    const tabs = await browser.tabs.query({ active: true });
    // TODO: change to pushMessage
    await Promise.all(tabs.map((tab) => browser.tabs.sendMessage(tab.id as number, setSelected(commitment))));
  };

  private getIdentitiesFromStore = async (): Promise<Map<string, string>> => {
    const cipherText = await this.identitiesStore.get<string>();

    if (!cipherText) {
      return new Map();
    }

    const identitesDecrypted = this.lockService.decrypt(cipherText);
    return new Map(JSON.parse(identitesDecrypted) as Iterable<readonly [string, string]>);
  };

  private refresh = async (): Promise<void> => {
    await this.getIdentities();
  };
}
