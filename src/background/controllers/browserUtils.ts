import log from "loglevel";
import { browser, Windows } from "webextension-polyfill-ts";

interface CreateWindowArgs {
  type: "popup";
  focused: boolean;
  width: number;
  height: number;
  tabId?: number;
  url?: string;
}

interface CreateTabArgs {
  url?: string;
  index?: number;
  highlighted?: boolean;
  active?: boolean;
}

interface OpenPopupArgs {
  params?: Record<string, string>;
}

class BrowserUtils {
  private cached: Windows.Window | null = null;

  public constructor() {
    this.removeWindow((windowId: number) => {
      log.debug("Inside removeWindow onRemove");

      try {
        // TODO: Check either internalLogout() or logout()
        // await LockService.internalLogout();
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

  public openPopup = async ({ params }: OpenPopupArgs = {}) => {
    if (this.cached?.id) {
      await this.focusWindow(this.cached.id);
      return this.cached;
    }

    const tabs = await browser.tabs.query({});
    const index = tabs.findIndex((tab) => tab.active && tab.highlighted);
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : "";
    const tab = await this.createTab({
      url: `popup.html${searchParams}`,
      active: index >= 0,
      index: index >= 0 ? index : undefined,
    });

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

  public closePopup = async () => {
    if (this.cached?.id) {
      await browser.windows.remove(this.cached.id);
      this.cached = null;
    }
  };

  private createTab = async (options: CreateTabArgs) => browser.tabs.create(options);

  private removeWindow = (callback: (windowId: number) => void) => {
    // TODO: Converted from browser. to chrome. solved the error
    browser.windows.onRemoved.addListener(callback);
  };

  private createWindow = async (options: CreateWindowArgs) => browser.windows.create(options);

  private focusWindow = (windowId: number) => browser.windows.update(windowId, { focused: true });
}

export default new BrowserUtils();
