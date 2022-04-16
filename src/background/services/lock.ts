import CryptoJS from 'crypto-js'
import pushMessage from '@src/util/pushMessage'
import { setStatus } from '@src/ui/ducks/app'
import { browser } from 'webextension-polyfill-ts'
import SimpleStorage from './simple-storage'

const passwordKey: string = '@password@'

class LockService extends SimpleStorage {
    private isUnlocked: boolean
    private password?: string
    private passwordChecker: string
    private unlockCB?: any

    constructor() {
        super(passwordKey)
        this.isUnlocked = false
        this.password = undefined
        this.passwordChecker = 'Password is correct'
    }

    /**
     *  This method is called when install event occurs
     */
    setupPassword = async (password: string) => {
        const ciphertext: string = CryptoJS.AES.encrypt(this.passwordChecker, password).toString()
        await this.set(ciphertext)
        await this.unlock(password)
        await pushMessage(setStatus(await this.getStatus()))
    }

    getStatus = async () => {
        const ciphertext = await this.get()

        return {
            initialized: !!ciphertext,
            unlocked: this.isUnlocked
        }
    }

    awaitUnlock = async () => {
        if (this.isUnlocked) return

        return new Promise((resolve) => {
            this.unlockCB = resolve
        })
    }

    onUnlocked = () => {
        if (this.unlockCB) {
            this.unlockCB()
            this.unlockCB = undefined
        }
        return true
    }

    unlock = async (password: string): Promise<boolean> => {
        if (this.isUnlocked) return true

        const ciphertext = await this.get()

        if (!ciphertext) {
            throw new Error('Something badly gone wrong (reinstallation probably required)')
        }

        if (!password) {
            throw new Error('Password is not provided')
        }

        const bytes = CryptoJS.AES.decrypt(ciphertext, password)
        const retrievedPasswordChecker: string = bytes.toString(CryptoJS.enc.Utf8)

        if (retrievedPasswordChecker !== this.passwordChecker) {
            throw new Error('Incorrect password')
        }

        this.password = password
        this.isUnlocked = true

        const status = await this.getStatus()
        await pushMessage(setStatus(status))
        const tabs = await browser.tabs.query({ active: true })
        for (const tab of tabs) {
            await browser.tabs.sendMessage(tab.id as number, setStatus(status))
        }
        return true
    }

    logout = async (): Promise<boolean> => {
        this.isUnlocked = false
        this.password = undefined
        const status = await this.getStatus()
        await pushMessage(setStatus(status))
        const tabs = await browser.tabs.query({ active: true })
        for (const tab of tabs) {
            await browser.tabs.sendMessage(tab.id as number, setStatus(status))
        }
        return true
    }

    ensure = async (payload: any = null) => {
        if (!this.isUnlocked || !this.password) throw new Error('state is locked!')
        return payload
    }

    encrypt = async (payload: string): Promise<string> => {
        await this.ensure()
        return CryptoJS.AES.encrypt(payload, this.password).toString()
    }

    decrypt = async (ciphertext: string): Promise<string> => {
        await this.ensure()
        const bytes = CryptoJS.AES.decrypt(ciphertext, this.password)
        return bytes.toString(CryptoJS.enc.Utf8)
    }
}

export default new LockService()
