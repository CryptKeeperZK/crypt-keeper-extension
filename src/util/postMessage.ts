import { browser } from 'webextension-polyfill-ts'

export type MessageAction = {
    method: string
    payload?: any
    error?: boolean
    meta?: any
}

export type BackgroundResponse = {
    res: any
}

export interface Message {
    data?: any;
    error?: any;
}

export default async function postMessage<BackgroundResponse>(message: MessageAction) {

    // src: https://stackoverflow.com/a/52089844/13072332
    return new Promise<BackgroundResponse>((resolve, reject) => {
        chrome.runtime.sendMessage(message, res => {
            if (chrome.runtime.lastError) {
                console.log("Last error happened!", chrome.runtime.lastError)
                reject(chrome.runtime.lastError);
            } else {
                resolve(res);
            }
        });
    });

    // const [err, res] = await browser.runtime.sendMessage(message)

    // if (err) {
    //     throw new Error(err)
    // }

    // return res
}
