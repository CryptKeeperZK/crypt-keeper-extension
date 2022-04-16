import { browser } from 'webextension-polyfill-ts'

export default class SimpleStorage {
    private key: string

    constructor(key) {
        this.key = key
    }

    get = async (): Promise<any | null> => {
        const content = await browser.storage.sync.get(this.key)
        return content ? content[this.key] : null
    }

    set = async (value) => browser.storage.sync.set({ [this.key]: value })

    clear = async () => browser.storage.sync.remove(this.key)
}
