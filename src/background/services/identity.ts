import { bigintToHex } from 'bigint-conversion'
import pushMessage from '@src/util/pushMessage'
import { setIdentities, setSelected } from '@src/ui/ducks/identities'
import { browser } from 'webextension-polyfill-ts'
import { IdentityMetadata, IdentityName } from '@src/types'
import SimpleStorage from './simple-storage'
import SimpleStorage2 from './simple-storage copy'
import LockService from './lock'
import ZkIdentityDecorater from '../identity-decorater'

const DB_KEY = '@@IDS-t1@@'
const IDENTITY_KEY = 'IDS'

export default class IdentityService extends SimpleStorage {
    identities: Map<string, string>
    activeIdentity?: ZkIdentityDecorater
    identitiesStore: SimpleStorage;

    constructor() {
        super(DB_KEY);
        this.identities = new Map();
        this.activeIdentity = undefined;
        this.identitiesStore = new SimpleStorage(IDENTITY_KEY);
        console.log(`IdentityService constructor identities`, this.identities);
        console.log(`IdentityService constructor typeof identities`, typeof this.identities);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unlock = async (_: any) => {
        const encryptedContent = await this.get()
        if (!encryptedContent) return true

        const decrypted: any = await LockService.decrypt(encryptedContent)
        await this.loadInMemory(JSON.parse(decrypted))
        await this.setDefaultIdentity()

        pushMessage(setIdentities(await this.getIdentities()))
        return true
    }

    refresh = async () => {
        const encryptedContent = await this.get()
        if (!encryptedContent) return

        const decrypted: any = await LockService.decrypt(encryptedContent)
        await this.loadInMemory(JSON.parse(decrypted))
        // if the first identity just added, set it to active
        const identities = await this.getIdentitiesFromStore();
        if (identities.size === 1) {
            await this.setDefaultIdentity()
        }

        pushMessage(setIdentities(await this.getIdentities()))
    }

    loadInMemory = async (decrypted: any) => {
        const identities = await this.getIdentitiesFromStore();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(decrypted || {}).forEach(async ([_, value]) => {
            const identity: ZkIdentityDecorater = ZkIdentityDecorater.genFromSerialized(value as string)
            const identityCommitment: bigint = identity.genIdentityCommitment()
            console.log(`IdentityService loadInMemory identities before`, identities);
            identities.set(bigintToHex(identityCommitment), identity.serialize())
            console.log(`IdentityService loadInMemory identities after`, identities);
            console.log(`IdentityService loadInMemory Object.fromEntries(identities)`, Object.fromEntries(identities));
            console.log(`IdentityService loadInMemory JSON.stringify(identities)`, JSON.stringify(identities));
            console.log(`IdentityService loadInMemory JSON.parse(identities)`, JSON.parse(JSON.stringify(identities)));
            try {
                const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
                const cipertext = await LockService.encrypt(serializedIdentities);
                // @src https://stackoverflow.com/a/67380395/13072332
                await this.identitiesStore.set(cipertext);
            } catch (error) {
                throw new Error(`Error in storing ${error}`)
            }
        })
    }

    setDefaultIdentity = async () => {
        const identities = await this.getIdentitiesFromStore();

        if (!identities.size) return

        const firstKey: string = identities.keys().next().value
        this.activeIdentity = ZkIdentityDecorater.genFromSerialized(identities.get(firstKey)!);
    }

    setActiveIdentity = async (identityCommitment: string) => {
        const identities = await this.getIdentitiesFromStore();
        
        if (identities.has(identityCommitment)) {
            this.activeIdentity = ZkIdentityDecorater.genFromSerialized(identities.get(identityCommitment)!);
            pushMessage(setSelected(identityCommitment))
            const tabs = await browser.tabs.query({ active: true })
            for (const tab of tabs) {
                console.log("Inside setActiveIdentity 1")
                await browser.tabs.sendMessage(tab.id as number, setSelected(identityCommitment))
                console.log("Inside setActiveIdentity 2")
            }
        }
    }

    setIdentityName = async (payload: IdentityName): Promise<boolean> => {
        const identities = await this.getIdentitiesFromStore();

        console.log("payload", payload)
        const {identityCommitment, name} = payload;
        console.log("payload commitment", identityCommitment)
        console.log("payload name", name)
        const id = identities.get(identityCommitment);
        if(id) {
            const identity = ZkIdentityDecorater.genFromSerialized(id);
            identity.setIdentityMetadataName(name);
            identities.set(identityCommitment, identity.serialize());
            await this.identitiesStore.set(Object.fromEntries(identities));
            pushMessage(setIdentities(await this.getIdentities()))
            return true;
        } else {
            console.log("setIdentityName id not exist")
            return false;
        }
    }

    deleteIdentity = async (payload: any): Promise<boolean> => {
        const identities = await this.getIdentitiesFromStore();

        const {identityCommitment} = payload;
        const id = identities.get(identityCommitment);
        if(id) {
            console.log("deleteIdentity id deleted")
            identities.delete(identityCommitment);
            await this.identitiesStore.set(Object.fromEntries(identities));
            pushMessage(setIdentities(await this.getIdentities()))
            return true;
        } else {
            console.log("deleteIdentity id is not deleted")
            return false;
        }
    } 

    getActiveidentity = async (): Promise<ZkIdentityDecorater | undefined> => this.activeIdentity

    getIdentityCommitments = async () => {
        const commitments: string[] = []
        const identities = await this.getIdentitiesFromStore();
        for (const key of identities.keys()) {
            console.log("getIdentityCOmmitments: ", key);
            commitments.push(key)
        }
        return {commitments, identities}
    }

    getIdentities = async (): Promise<({ commitment: string; metadata: IdentityMetadata })[]> => {
        const { commitments, identities } = await this.getIdentityCommitments()
        console.log("IdentityService getIdentities: ", commitments);
        
        return commitments.filter(commitment => {
            if (typeof identities.get(commitment) != undefined) return commitment;
        }).map(commitment => {
            const serializedIdentity = identities.get(commitment) as string;
            const identity = ZkIdentityDecorater.genFromSerialized(serializedIdentity);
            console.log("getIdentities: commitments", commitments);
            console.log("getIdentities: metadata", identity!.metadata);
            return {
                commitment,
                metadata: identity!.metadata
            }
        });
    }

    insert = async (newIdentity: ZkIdentityDecorater): Promise<boolean> => {
        console.log(`IdentityService insert newIdentity`, newIdentity);
        console.log(`IdentityService insert typeof newIdentity`, typeof newIdentity);
        const identities = await this.getIdentitiesFromStore();
        console.log(`IdentityService insert identities:`, identities);
        console.log(`IdentityService insert type identities: ${typeof identities}`);
        const identityCommitment: string = bigintToHex(newIdentity.genIdentityCommitment())
        const existing: boolean = identities.has(identityCommitment)

        if (existing) return false

        const existingIdentites: string[] = []
        for (const serializedIdentity of identities.values()) {
            console.log(`IdentityService insert identity:`, serializedIdentity);
            console.log(`IdentityService insert type identity:`, typeof serializedIdentity);
            existingIdentites.push(serializedIdentity)
        }

        const newValue: string[] = [...existingIdentites, newIdentity.serialize()]
        const ciphertext: string = await LockService.encrypt(JSON.stringify(newValue))
        console.log("IdentityService ciphertext value", ciphertext);

        await this.set(ciphertext)
        console.log("IdentityService ciphertext value 1");
        await this.refresh()
        console.log("IdentityService ciphertext value 2");
        await this.setActiveIdentity(identityCommitment)
        console.log("IdentityService ciphertext value 3");
        return true
    }

    getNumOfIdentites = async (): Promise<number> => {
        const identities = await this.getIdentitiesFromStore();
        return identities.size
    }

    public async getIdentitiesFromStore(): Promise<Map<string, string>> {
        const cipertext = await this.identitiesStore.get();

        console.log(`IdentityService getIdentitiesFromStore EXIST cipertext`, cipertext);

        if (cipertext) {
            const identitesDecrepted = await LockService.decrypt(cipertext);
            console.log(`IdentityService getIdentitiesFromStore EXIST identitesDecrepted`, identitesDecrepted);
            const identitiesParsed = JSON.parse(identitesDecrepted);
            console.log(`IdentityService getIdentitiesFromStore EXIST identitiesParsed`, identitiesParsed);
            return new Map(identitiesParsed);
        } else {
            console.log(`IdentityService getIdentitiesFromStore NEW identitesObj`, cipertext);
            return new Map() as Map<string, string>;
        }
    }
}


