import { bigintToHex } from "bigint-conversion";
import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

import { setIdentities, setSelected } from "@src/ui/ducks/identities";
import pushMessage from "@src/util/pushMessage";
import { IdentityMetadata, IdentityName } from "@src/types";

import ZkIdentityDecorater from "../identityDecorater";
import SimpleStorage from "./simpleStorage";
import LockService from "./lock";

const IDENTITY_KEY = "@@ID@@";
const ACTIVE_IDENTITY_KEY = "@@AID@@";

export default class IdentityService {
  identities: Map<string, string>;
  activeIdentity?: ZkIdentityDecorater;
  identitiesStore: SimpleStorage;
  activeIdentityStore: SimpleStorage;

  constructor() {
    this.identities = new Map();
    this.activeIdentity = undefined;
    this.identitiesStore = new SimpleStorage(IDENTITY_KEY);
    this.activeIdentityStore = new SimpleStorage(ACTIVE_IDENTITY_KEY);
    log.debug("IdentityService constructor identities", this.identities);
    log.debug("IdentityService constructor typeof identities", typeof this.identities);
  }

  unlock = async () => {
    await this.setDefaultIdentity();
    await pushMessage(setIdentities(await this.getIdentities()));

    return true;
  };

  refresh = async () => {
    // if the first identity just added, set it to active
    const identities = await this.getIdentitiesFromStore();
    if (identities.size === 1) {
      await this.setDefaultIdentity();
    }

    await pushMessage(setIdentities(await this.getIdentities()));
  };

  setDefaultIdentity = async () => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      await this.clearActiveIdentity();
      return;
    }

    const { value: firstKey } = identities.keys().next();

    await this.setActiveIdentity(firstKey);
  };

  setActiveIdentity = async (identityCommitment: string) => {
    const identities = await this.getIdentitiesFromStore();

    if (identities.has(identityCommitment)) {
      this.activeIdentity = ZkIdentityDecorater.genFromSerialized(identities.get(identityCommitment) as string);
      await this.saveActiveIdentity(identityCommitment);
    }
  };

  setIdentityName = async (payload: IdentityName): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    log.debug("payload", payload);
    const { identityCommitment, name } = payload;
    log.debug("payload commitment", identityCommitment);
    log.debug("payload name", name);
    const id = identities.get(identityCommitment);

    if (id) {
      const identity = ZkIdentityDecorater.genFromSerialized(id);
      identity.setIdentityMetadataName(name);
      identities.set(identityCommitment, identity.serialize());

      const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
      const cipertext = await LockService.encrypt(serializedIdentities);
      await this.identitiesStore.set(cipertext);
      await pushMessage(setIdentities(await this.getIdentities()));

      return true;
    } else {
      log.debug("setIdentityName id not exist");
      return false;
    }
  };

  deleteIdentity = async (payload: any): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    const { identityCommitment } = payload;
    const id = identities.get(identityCommitment);
    if (id) {
      log.debug("deleteIdentity id deleted");
      identities.delete(identityCommitment);

      const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
      const cipertext = await LockService.encrypt(serializedIdentities);
      await this.identitiesStore.set(cipertext);
      await this.setDefaultIdentity();
      await pushMessage(setIdentities(await this.getIdentities()));

      return true;
    } else {
      log.debug("deleteIdentity id is not deleted");
      return false;
    }
  };

  deleteAllIdentities = async () => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      return;
    }

    await this.identitiesStore.clear();
    await this.clearActiveIdentity();
    await pushMessage(setIdentities([]));
  };

  private clearActiveIdentity = async () => {
    if (!this.activeIdentity) {
      return;
    }

    this.activeIdentity = undefined;
    await this.saveActiveIdentity("");
  };

  private saveActiveIdentity = async (commitment: string) => {
    const identityCommitmentCipher = await LockService.encrypt(commitment);
    await this.activeIdentityStore.set(identityCommitmentCipher);
    await pushMessage(setSelected(commitment));

    const tabs = await browser.tabs.query({ active: true });
    for (const tab of tabs) {
      await browser.tabs.sendMessage(tab.id as number, setSelected(commitment));
    }
  };

  getActiveIdentity = async (): Promise<ZkIdentityDecorater | undefined> => {
    const acitveIdentityCommitmentCipher = await this.activeIdentityStore.get<string>();

    if (!acitveIdentityCommitmentCipher) {
      return undefined;
    }

    const acitveIdentityCommitment = await LockService.decrypt(acitveIdentityCommitmentCipher);
    const identities = await this.getIdentitiesFromStore();

    if (identities.has(acitveIdentityCommitment)) {
      this.activeIdentity = ZkIdentityDecorater.genFromSerialized(identities.get(acitveIdentityCommitment) as string);

      return this.activeIdentity;
    }

    return undefined;
  };

  getIdentityCommitments = async () => {
    const commitments: string[] = [];
    const identities = await this.getIdentitiesFromStore();

    for (const key of identities.keys()) {
      log.debug("getIdentityCOmmitments: ", key);
      commitments.push(key);
    }

    return { commitments, identities };
  };

  getIdentities = async (): Promise<{ commitment: string; metadata: IdentityMetadata }[]> => {
    const { commitments, identities } = await this.getIdentityCommitments();
    log.debug("IdentityService getIdentities: ", commitments);

    return commitments
      .filter(commitment => typeof identities.get(commitment) != undefined)
      .map(commitment => {
        const serializedIdentity = identities.get(commitment) as string;
        const identity = ZkIdentityDecorater.genFromSerialized(serializedIdentity);
        log.debug("getIdentities: commitments", commitments);
        log.debug("getIdentities: metadata", identity?.metadata);

        return {
          commitment,
          metadata: identity?.metadata,
        };
      });
  };

  insert = async (newIdentity: ZkIdentityDecorater): Promise<boolean> => {
    log.debug("IdentityService insert newIdentity", newIdentity);
    log.debug("IdentityService insert typeof newIdentity", typeof newIdentity);
    const identities = await this.getIdentitiesFromStore();
    log.debug("IdentityService insert identities:", identities);
    log.debug(`IdentityService insert type identities: ${typeof identities}`);
    const identityCommitment = bigintToHex(newIdentity.genIdentityCommitment());
    const existing = identities.has(identityCommitment);

    if (existing) {
      return false;
    }

    identities.set(identityCommitment, newIdentity.serialize());
    const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
    const cipertext = await LockService.encrypt(serializedIdentities);
    await this.identitiesStore.set(cipertext);

    log.debug("IdentityService ciphertext value 1");
    await this.refresh();
    log.debug("IdentityService ciphertext value 2");
    await this.setActiveIdentity(identityCommitment);
    log.debug("IdentityService ciphertext value 3");
    return true;
  };

  getNumOfIdentites = async (): Promise<number> => {
    const identities = await this.getIdentitiesFromStore();
    return identities.size;
  };

  async getIdentitiesFromStore(): Promise<Map<string, string>> {
    const cipertext = await this.identitiesStore.get<string>();

    log.debug("IdentityService getIdentitiesFromStore EXIST cipertext 1", cipertext);
    log.debug("IdentityService getIdentitiesFromStore EXIST cipertext 2", typeof cipertext);
    log.debug("IdentityService getIdentitiesFromStore EXIST cipertext 3", JSON.stringify(cipertext));

    if (cipertext) {
      const identitesDecrepted = await LockService.decrypt(cipertext);
      log.debug("IdentityService getIdentitiesFromStore EXIST identitesDecrepted 1" + identitesDecrepted);
      log.debug(typeof identitesDecrepted);
      log.debug(identitesDecrepted);
      log.debug("IdentityService getIdentitiesFromStore EXIST identitesDecrepted 2");
      const identitiesParsed = JSON.parse(identitesDecrepted);
      log.debug("IdentityService getIdentitiesFromStore EXIST identitiesParsed" + identitiesParsed);
      return new Map(identitiesParsed);
    } else {
      log.debug("IdentityService getIdentitiesFromStore NEW identitesObj", cipertext);
      return new Map();
    }
  }
}
