import { browser } from 'webextension-polyfill-ts'

export default class SimpleStorage {
    private key: string

    constructor(key: string) {
        this.key = key
    }

    // src: https://stackoverflow.com/a/57551361/13072332
    get = async (): Promise<any | null> => {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.sync.get(this.key, (value) => {
                    value ? resolve(value[this.key]) : resolve(null);
                })
            }
            catch (e) {
                reject(e);
            }
        });
    }

    set = async (value: string | string[]) => chrome.storage.sync.set({ [this.key]: value })

    clear = async () => chrome.storage.sync.remove(this.key)
}
