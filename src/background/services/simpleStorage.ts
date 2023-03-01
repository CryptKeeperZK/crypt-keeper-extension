import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

export default class SimpleStorage {
  private key: string;

  constructor(key: string) {
    this.key = key;

    browser.storage.onChanged.addListener((changes, namespace) => {
      for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        log.debug(
          `Storage key "${key}" in namespace "${namespace}" changed.`,
          `Old value was "${oldValue}", new value is "${newValue}".`,
        );
      }
    });
  }

  get = async <T>(): Promise<T | null> => {
    const content = await browser.storage.sync.get(this.key);
    return content?.[this.key] ?? null;
  };

  set = async <T>(value: T): Promise<void> => {
    browser.storage.sync.set({ [this.key]: value });
  };

  clear = async (): Promise<void> => {
    browser.storage.sync.remove(this.key);
  };
}
