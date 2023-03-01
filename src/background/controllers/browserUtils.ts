import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

class BrowserUtils {
  cached: any | null;

  constructor() {
    this.removeWindow((windowId: any) => {
      log.debug("Inside removeWindow onRemove");

      try {
        // TODO: Check either internalLogout() or logout()
        //await LockService.internalLogout();
        log.debug("Inside removeWindow onRemove locked");
        if (this.cached?.id === windowId) {
          this.cached = null;
          log.debug("Inside removeWindow onRemove cleaned");
        }
      } catch (error) {
        log.debug("Inside removeWindow onRemove error", error);
      }
    });
  }

  createTab = async (options: any) => browser.tabs.create(options);

  removeWindow = (callback: any) => {
    // TODO: Converted from browser. to chrome. solved the error
    browser.windows.onRemoved.addListener(callback);
  };

  createWindow = async (options: any) => browser.windows.create(options);

  openPopup = async () => {
    if (this.cached) {
      await this.focusWindow(this.cached.id);
      return this.cached;
    }

    const tab = await this.createTab({ url: "popup.html", active: false });

    // TODO add this in config/constants...
    const popup = await this.createWindow({
      tabId: tab.id,
      type: "popup",
      focused: true,
      width: 357,
      height: 600,
    });

    this.cached = popup;
    return popup;
  };

  closePopup = async () => {
    if (this.cached) {
      browser.windows.remove(this.cached.id);
      this.cached = null;
    }
  };

  focusWindow = windowId => browser.windows.update(windowId, { focused: true });

  getAllWindows = () => browser.windows.getAll();

  activatedTabs = (callback: any) => {
    browser.tabs.onActivated.addListener(callback);
  };

  sendMessageTabs = async (tabId: number, message: any) => {
    await browser.tabs.sendMessage(tabId, message);
  };
}

export default new BrowserUtils();
