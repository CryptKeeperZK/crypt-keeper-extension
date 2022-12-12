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
    identities: Map<string, ZkIdentityDecorater>
    activeIdentity?: ZkIdentityDecorater
    identitiesStore: SimpleStorage2;

    constructor() {
        super(DB_KEY);
        this.identities = new Map();
        this.activeIdentity = undefined;
        this.identitiesStore = new SimpleStorage2(IDENTITY_KEY);
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
            identities.set(bigintToHex(identityCommitment), identity)
            console.log(`IdentityService loadInMemory identities after`, identities);
            try {
                // @src https://stackoverflow.com/a/67380395/13072332
                await this.identitiesStore.set(Object.fromEntries(identities));
            } catch (error) {
                throw new Error(`Error in storing ${error}`)
            }
        })
    }

    setDefaultIdentity = async () => {
        const identities = await this.getIdentitiesFromStore();

        if (!identities.size) return

        const firstKey: string = identities.keys().next().value
        this.activeIdentity = identities.get(firstKey)
    }

    setActiveIdentity = async (identityCommitment: string) => {
        const identities = await this.getIdentitiesFromStore();
        
        if (identities.has(identityCommitment)) {
            this.activeIdentity = identities.get(identityCommitment)
            pushMessage(setSelected(identityCommitment))
            const tabs = await browser.tabs.query({ active: true })
            for (const tab of tabs) {
                console.log("Inside setActiveIdentity 1")
                await browser.tabs.sendMessage(tab.id as number, setSelected(identityCommitment))
                console.log("Inside setActiveIdentity 2")
            }
        }
    }

    setIdentityName = async (payload: IdentityName): Promise<IdentityMetadata | null> => {
        const identities = await this.getIdentitiesFromStore();

        console.log("payload", payload)
        const {identityCommitment, name} = payload;
        console.log("payload commitment", identityCommitment)
        console.log("payload name", name)
        const id = identities.get(identityCommitment);
        if(id) {
            const metadata = id.setIdentityMetadataName(name);
            return metadata;
        } else {
            console.log("setIdentityName id not exist")
            return null;
        }
    }

    deleteIdentity = async (payload: any): Promise<boolean> => {
        const identities = await this.getIdentitiesFromStore();

        const {identityCommitment} = payload;
        const id = identities.get(identityCommitment);
        if(id) {
            console.log("deleteIdentity id deleted")
            return identities.delete(identityCommitment);
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
        return commitments
    }

    getIdentities = async (): Promise<{ commitment: string; metadata: IdentityMetadata }[]> => {
        const commitments = await this.getIdentityCommitments()
        console.log("IdentityService getIdentities: ", commitments);
        const identities = await this.getIdentitiesFromStore();
        return commitments.map((commitment) => {
            const id = identities.get(commitment)
            console.log("getIdentities: commitments", commitments);
            console.log("getIdentities: metadata", id!.metadata);
            return {
                commitment,
                metadata: id!.metadata
            }
        })
    }

    insert = async (newIdentity: ZkIdentityDecorater): Promise<boolean> => {
        const identities = await this.getIdentitiesFromStore();
        console.log(`IdentityService insert identities:`, identities);
        console.log(`IdentityService insert type identities: ${typeof identities}`);
        const identityCommitment: string = bigintToHex(newIdentity.genIdentityCommitment())
        const existing: boolean = identities.has(identityCommitment)

        if (existing) return false

        const existingIdentites: string[] = []
        for (const identity of identities.values()) {
            existingIdentites.push(identity.serialize())
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

    public async getIdentitiesFromStore(): Promise<Map<string, ZkIdentityDecorater>> {
        const identitesObj = await this.identitiesStore.get();

        if (identitesObj) {
            console.log(`IdentityService getIdentitiesFromStore EXIST identitesObj`, identitesObj);
            return new Map(Object.entries(identitesObj)) as Map<string, ZkIdentityDecorater>;
        } else {
            console.log(`IdentityService getIdentitiesFromStore NEW identitesObj`, identitesObj);
            return new Map() as Map<string, ZkIdentityDecorater>;
        }
    }
}


