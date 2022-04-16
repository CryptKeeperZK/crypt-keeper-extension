import { browser } from 'webextension-polyfill-ts'

export async function get(key): Promise<any | null> {
    const content = await browser.storage.sync.get(key)
    return content ? content[key] : null
}

export async function set(key, value) {
    return browser.storage.sync.set({ [key]: value })
}
