import { browser } from 'webextension-polyfill-ts'

class BrowserUtils {
    cached: any | null

    constructor() {
        browser.windows.onRemoved.addListener((windowId) => {
            if (this.cached?.id === windowId) {
                this.cached = null
            }
        })
    }

    createTab = async (options: any) => browser.tabs.create(options)

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
}

export default new BrowserUtils()
