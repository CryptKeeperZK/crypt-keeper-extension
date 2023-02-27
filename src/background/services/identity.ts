import { bigintToHex } from "bigint-conversion";
import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

import { setIdentities, setSelected } from "@src/ui/ducks/identities";
import pushMessage from "@src/util/pushMessage";
import { IdentityMetadata, IdentityName } from "@src/types";

import ZkIdentityDecorater from "../identityDecorater";
import SimpleStorage from "./simpleStorage";
import LockService from "./lock";

const DB_KEY = "@@IDS-t1@@";
const IDENTITY_KEY = "IDS";
const ACTIVE_IDENTITY_KEY = /* Pool is closed due to */ "AIDS";

export default class IdentityService extends SimpleStorage {
  identities: Map<string, string>;
  activeIdentity?: ZkIdentityDecorater;
  identitiesStore: SimpleStorage;
  activeIdentityStore: SimpleStorage;

  constructor() {
    super(DB_KEY);
    this.identities = new Map();
    this.activeIdentity = undefined;
    this.identitiesStore = new SimpleStorage(IDENTITY_KEY);
    this.activeIdentityStore = new SimpleStorage(ACTIVE_IDENTITY_KEY);
    log.debug("IdentityService constructor identities", this.identities);
    log.debug("IdentityService constructor typeof identities", typeof this.identities);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unlock = async (_: any) => {
    const encryptedContent = await this.get<string>();
    if (!encryptedContent) return true;

    const decrypted = await LockService.decrypt(encryptedContent);
    await this.loadInMemory(JSON.parse(decrypted));
    await this.setDefaultIdentity();

    pushMessage(setIdentities(await this.getIdentities()));
    return true;
  };

  refresh = async () => {
    const encryptedContent = await this.get<string>();
    if (!encryptedContent) return;

    const decrypted = await LockService.decrypt(encryptedContent);
    await this.loadInMemory(JSON.parse(decrypted));
    // if the first identity just added, set it to active
    const identities = await this.getIdentitiesFromStore();
    if (identities.size === 1) {
      await this.setDefaultIdentity();
    }

    pushMessage(setIdentities(await this.getIdentities()));
  };

  loadInMemory = async (decrypted: any) => {
    const identities = await this.getIdentitiesFromStore();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(decrypted || {}).forEach(async ([_, value]) => {
      const identity: ZkIdentityDecorater = ZkIdentityDecorater.genFromSerialized(value as string);
      const identityCommitment: bigint = identity.genIdentityCommitment();
      log.debug("IdentityService loadInMemory identities before", identities);
      identities.set(bigintToHex(identityCommitment), identity.serialize());
      log.debug("IdentityService loadInMemory identities after", identities);
      log.debug("IdentityService loadInMemory Object.fromEntries(identities)", Object.fromEntries(identities));
      log.debug("IdentityService loadInMemory JSON.stringify(identities)", JSON.stringify(identities));
      log.debug("IdentityService loadInMemory JSON.parse(identities)", JSON.parse(JSON.stringify(identities)));
      try {
        const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
        const cipertext = await LockService.encrypt(serializedIdentities);
        // @src https://stackoverflow.com/a/67380395/13072332
        await this.identitiesStore.set(cipertext);
      } catch (error) {
        throw new Error(`Error in storing ${error}`);
      }
    });
  };

  setDefaultIdentity = async () => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) return;

    const { value: firstKey } = identities.keys().next();
    this.activeIdentity = ZkIdentityDecorater.genFromSerialized(identities.get(firstKey) as string);
  };

  setActiveIdentity = async (identityCommitment: string) => {
    const identities = await this.getIdentitiesFromStore();

    if (identities.has(identityCommitment)) {
      const identityCommitmentCipher = await LockService.encrypt(identityCommitment);
      await this.activeIdentityStore.set(identityCommitmentCipher as string);
      this.activeIdentity = ZkIdentityDecorater.genFromSerialized(identities.get(identityCommitment) as string);
      pushMessage(setSelected(identityCommitment));

      const tabs = await browser.tabs.query({ active: true });
      for (const tab of tabs) {
        log.debug("Inside setActiveIdentity 1");
        await browser.tabs.sendMessage(tab.id as number, setSelected(identityCommitment));
        log.debug("Inside setActiveIdentity 2");
      }
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
      pushMessage(setIdentities(await this.getIdentities()));
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
      pushMessage(setIdentities(await this.getIdentities()));
      return true;
    } else {
      log.debug("deleteIdentity id is not deleted");
      return false;
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

    log.error("IdentityService cannot find Identity commitment");
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
    const identityCommitment: string = bigintToHex(newIdentity.genIdentityCommitment());
    const existing: boolean = identities.has(identityCommitment);

    if (existing) {
      return false;
    }

    const existingIdentites: string[] = [];
    for (const serializedIdentity of identities.values()) {
      log.debug("IdentityService insert identity:", serializedIdentity);
      log.debug("IdentityService insert type identity:", typeof serializedIdentity);
      existingIdentites.push(serializedIdentity);
    }

    const newValue: string[] = [...existingIdentites, newIdentity.serialize()];
    const ciphertext: string = await LockService.encrypt(JSON.stringify(newValue));
    log.debug("IdentityService ciphertext value", ciphertext);

    await this.set(ciphertext);
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
