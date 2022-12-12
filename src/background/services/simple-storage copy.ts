import { browser } from 'webextension-polyfill-ts'

export default class SimpleStorage2 {
    private key: string

    constructor(key) {
        this.key = key;
        browser.storage.onChanged.addListener((changes, namespace) => {
            for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
                console.log(
                    `Storage 2 key "${key}" in namespace "${namespace}" changed.`,
                    `Old value was "${oldValue}", new value is".`, newValue
                );
            }
        });
    }

    get = async (): Promise<any | undefined> => {
        const content = await browser.storage.sync.get(this.key)
        console.log(`SimpleStorage2 content`, content);
        return content ? content[this.key] : undefined
    }

    set = async (value) => {
        console.log(`SimpleStorage2 set`)
        await browser.storage.sync.set({ [this.key]: value })
    }

    clear = async () => browser.storage.sync.remove(this.key)
}