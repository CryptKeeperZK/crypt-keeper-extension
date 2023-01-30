import log from 'loglevel';
import { browser } from 'webextension-polyfill-ts'

export default class SimpleStorage {
    private key: string

    constructor(key) {
        this.key = key;
        browser.storage.onChanged.addListener((changes, namespace) => {
            for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
                log.debug(
                    `Storage key "${key}" in namespace "${namespace}" changed.`,
                    `Old value was "${oldValue}", new value is "${newValue}".`
                );
            }
        });
    }

    get = async (): Promise<any | null> => {
        const content = await browser.storage.sync.get(this.key)
        return content ? content[this.key] : null
    }

    set = async (value) => browser.storage.sync.set({ [this.key]: value })

    clear = async () => browser.storage.sync.remove(this.key)
}