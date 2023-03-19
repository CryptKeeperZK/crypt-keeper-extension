import { browser, Windows } from "webextension-polyfill-ts";

import type RequestManager from "./requestManager";

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

export default class BrowserUtils {
  private static INSTANCE: BrowserUtils;

  private cached: Windows.Window | null = null;

  private constructor() {
    this.addRemoveWindowListener(this.cleanCache);
  }

  public static getInstance(): BrowserUtils {
    if (!BrowserUtils.INSTANCE) {
      BrowserUtils.INSTANCE = new BrowserUtils();
    }

    return BrowserUtils.INSTANCE;
  }

  public openPopup = async ({ params }: OpenPopupArgs = {}): Promise<Windows.Window> => {
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

  public closePopup = async (): Promise<boolean> => {
    if (this.cached?.id) {
      await browser.windows.remove(this.cached.id);
      this.cached = null;
    }

    return true;
  };

  public addRemoveWindowListener = (callback: (windowId: number) => void): void => {
    browser.windows.onRemoved.addListener(callback);
  };

  public removeRemoveWindowListener = (callback: (windowId: number) => void): void => {
    browser.windows.onRemoved.removeListener(callback);
  };

  private createTab = async (options: CreateTabArgs) => browser.tabs.create(options);

  private createWindow = async (options: CreateWindowArgs) => browser.windows.create(options);

  private focusWindow = (windowId: number) => browser.windows.update(windowId, { focused: true });

  private cleanCache = (windowId: number) => {
    if (this.cached?.id === windowId) {
      this.cached = null;
    }
  };
}
