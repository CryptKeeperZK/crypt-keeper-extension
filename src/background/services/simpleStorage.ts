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

  public async get<T>(): Promise<T | null> {
    const content = await browser.storage.sync.get(this.key);
    return content?.[this.key] ?? null;
  }

  public async set<T>(value: T): Promise<void> {
    browser.storage.sync.set({ [this.key]: value });
  }

  public async clear(): Promise<void> {
    browser.storage.sync.remove(this.key);
  }
}
