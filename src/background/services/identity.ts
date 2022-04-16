import { bigintToHex } from 'bigint-conversion'
import pushMessage from '@src/util/pushMessage'
import { setIdentities, setSelected } from '@src/ui/ducks/identities'
import { browser } from 'webextension-polyfill-ts'
import { IdentityMetadata } from '@src/types'
import SimpleStorage from './simple-storage'
import LockService from './lock'
import ZkIdentityDecorater from '../identity-decorater'

const DB_KEY = '@@IDS-t1@@'

export default class IdentityService extends SimpleStorage {
    identities: Map<string, ZkIdentityDecorater>
    activeIdentity?: ZkIdentityDecorater

    constructor() {
        super(DB_KEY)
        this.identities = new Map()
        this.activeIdentity = undefined
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
        if (this.identities.size === 1) {
            await this.setDefaultIdentity()
        }

        pushMessage(setIdentities(await this.getIdentities()))
    }

    loadInMemory = async (decrypted: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(decrypted || {}).forEach(([_, value]) => {
            const identity: ZkIdentityDecorater = ZkIdentityDecorater.genFromSerialized(value as string)
            const identityCommitment: bigint = identity.genIdentityCommitment()
            this.identities.set(bigintToHex(identityCommitment), identity)
        })
    }

    setDefaultIdentity = async () => {
        if (!this.identities.size) return

        const firstKey: string = this.identities.keys().next().value
        this.activeIdentity = this.identities.get(firstKey)
    }

    setActiveIdentity = async (identityCommitment: string) => {
        if (this.identities.has(identityCommitment)) {
            this.activeIdentity = this.identities.get(identityCommitment)
            pushMessage(setSelected(identityCommitment))
            const tabs = await browser.tabs.query({ active: true })
            for (const tab of tabs) {
                await browser.tabs.sendMessage(tab.id as number, setSelected(identityCommitment))
            }
        }
    }

    getActiveidentity = async (): Promise<ZkIdentityDecorater | undefined> => this.activeIdentity

    getIdentityCommitments = async () => {
        const commitments: string[] = []
        for (const key of this.identities.keys()) {
            commitments.push(key)
        }
        return commitments
    }

    getIdentities = async (): Promise<{ commitment: string; metadata: IdentityMetadata }[]> => {
        const commitments = await this.getIdentityCommitments()
        return commitments.map((commitment) => {
            const id = this.identities.get(commitment)
            return {
                commitment,
                metadata: id!.metadata
            }
        })
    }

    insert = async (newIdentity: ZkIdentityDecorater): Promise<boolean> => {
        const identityCommitment: string = bigintToHex(newIdentity.genIdentityCommitment())
        const existing: boolean = this.identities.has(identityCommitment)

        if (existing) return false

        const existingIdentites: string[] = []
        for (const identity of this.identities.values()) {
            existingIdentites.push(identity.serialize())
        }

        const newValue: string[] = [...existingIdentites, newIdentity.serialize()]
        const ciphertext: string = await LockService.encrypt(JSON.stringify(newValue))

        await this.set(ciphertext)
        await this.refresh()
        await this.setActiveIdentity(identityCommitment)
        return true
    }

    getNumOfIdentites = (): number => this.identities.size
}
