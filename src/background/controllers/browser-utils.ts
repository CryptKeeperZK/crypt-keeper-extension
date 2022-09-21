import { browser } from 'webextension-polyfill-ts'
import LockService from '../services/lock'

class BrowserUtils {
    cached: any | null

    constructor() {
        this.removeWindow(async (windowId: any) => {
            console.log("Inside removeWindow onRemove");
            
            try {
                // TODO: Check either internalLogout() or logout()
                //await LockService.internalLogout();
                console.log("Inside removeWindow onRemove locked");
                if (this.cached?.id === windowId) {
                    this.cached = null
                    console.log("Inside removeWindow onRemove cleaned");
                }
            } catch (error) {
                console.log("Inside removeWindow onRemove error", error);
            }
        });
    }

    createTab = async (options: any) => browser.tabs.create(options)

    removeWindow = (callback: any) => {
        browser.windows.onRemoved.addListener(callback);
    }

    createWindow = async (options: any) => browser.windows.create(options)

    openPopup = async () => {
        if (this.cached) {
            this.focusWindow(this.cached.id)
            return this.cached
        }

        const tab = await this.createTab({ url: 'popup.html', active: false })

        // TODO add this in config/constants...
        const popup = await this.createWindow({
            tabId: tab.id,
            type: 'popup',
            focused: true,
            width: 357,
            height: 600
        })

        this.cached = popup
        return popup
    }

    closePopup = async () => {
        if (this.cached) {
            browser.windows.remove(this.cached.id)
        }
    }

    focusWindow = (windowId) => browser.windows.update(windowId, { focused: true })

    getAllWindows = () => browser.windows.getAll()

    activatedTabs = (callback: any) => {
        browser.tabs.onActivated.addListener(callback);
    }

    sendMessageTabs = async (tabId: number, message: any) => {
        await browser.tabs.sendMessage(tabId, message);
    }
}

export default new BrowserUtils()
