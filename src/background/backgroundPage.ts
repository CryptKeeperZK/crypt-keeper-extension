import { browser } from 'webextension-polyfill-ts'
import { Request } from '@src/types'
import ZkKepperController from './zk-kepeer'

// TODO consider adding inTest env
const app: ZkKepperController = new ZkKepperController()

app.initialize().then(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    browser.runtime.onMessage.addListener(async (request: Request, _) => {
        try {
            const res = await app.handle(request)
            return [null, res]
        } catch (e: any) {
            return [e.message, null]
        }
    })
})

browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason === 'install') {
        // TODO open html where password will be interested
        // browser.tabs.create({
        //   url: 'popup.html'
        // });
    }
    if (process.env.NODE_ENV === 'development') {
        // browser.tabs.create({ url: 'popup.html' });
    }
})
