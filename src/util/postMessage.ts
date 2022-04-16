import { browser } from 'webextension-polyfill-ts'

export type MessageAction = {
    method: string
    payload?: any
    error?: boolean
    meta?: any
}

export default async function postMessage(message: MessageAction) {
    const [err, res] = await browser.runtime.sendMessage(message)

    if (err) {
        throw new Error(err)
    }

    return res
}
