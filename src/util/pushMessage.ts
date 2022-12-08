import { ReduxAction } from '@src/types'
import { browser } from 'webextension-polyfill-ts'

export default async function pushMessage(message: ReduxAction) {
    // if (chrome && chrome.runtime) {
    //     return chrome.runtime.sendMessage(message)
    // }

    return browser.runtime.sendMessage(message)
}
