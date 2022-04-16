import pushMessage from '@src/util/pushMessage'
import { EventEmitter2 } from 'eventemitter2'
import { PendingRequest, PendingRequestType, RequestResolutionAction } from '@src/types'
import { setPendingRequest } from '@src/ui/ducks/requests'
import { browser } from 'webextension-polyfill-ts'
import BrowserUtils from './browser-utils'

let nonce = 0

export default class RequestManager extends EventEmitter2 {
    private pendingRequests: Array<PendingRequest>

    constructor() {
        super()
        this.pendingRequests = []
    }

    getRequests = (): PendingRequest[] => this.pendingRequests

    finalizeRequest = async (action: RequestResolutionAction<any>): Promise<boolean> => {
        const { id } = action
        if (!id) throw new Error('id not provided')
        // TODO add some mutex lock just in case something strange occurs
        this.pendingRequests = this.pendingRequests.filter((pendingRequest: PendingRequest) => pendingRequest.id !== id)
        this.emit(`${id}:finalized`, action)
        await pushMessage(setPendingRequest(this.pendingRequests))
        return true
    }

    addToQueue = async (type: PendingRequestType, payload?: any): Promise<string> => {
        // eslint-disable-next-line no-plusplus
        const id: string = `${nonce++}`
        this.pendingRequests.push({ id, type, payload })
        await pushMessage(setPendingRequest(this.pendingRequests))
        return id
    }

    newRequest = async (type: PendingRequestType, payload?: any) => {
        const id: string = await this.addToQueue(type, payload)
        const popup = await BrowserUtils.openPopup()

        return new Promise((resolve, reject) => {
            const onPopupClose = (windowId: number) => {
                if (windowId === popup.id) {
                    reject(new Error('user rejected.'))
                    browser.windows.onRemoved.removeListener(onPopupClose)
                }
            }

            browser.windows.onRemoved.addListener(onPopupClose)

            this.once(`${id}:finalized`, (action: RequestResolutionAction<any>) => {
                browser.windows.onRemoved.removeListener(onPopupClose)
                switch (action.status) {
                    case 'accept':
                        resolve(action.data)
                        return
                    case 'reject':
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject(new Error('user rejected.'))
                        return
                    default:
                        reject(new Error(`action: ${action.status} not supproted`))
                }
            })
        })
    }

    handlePopup = async () => {
        const newPopup = await BrowserUtils.openPopup()
        if (!newPopup?.id) throw new Error('Something went wrong in opening popup')
    }
}
