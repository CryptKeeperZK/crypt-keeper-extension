import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

export default class SimpleStorage {
  private key: string;

  public constructor(key: string) {
    this.key = key;

    browser.storage.onChanged.addListener((changes, namespace) => {
      Object.entries(changes).forEach(([name, { oldValue, newValue }]) => {
        log.debug(`Storage key "${name}" in namespace "${namespace}" changed.`);
        log.debug("Old value: ", oldValue);
        log.debug("New value: ", newValue);
      });
    });
  }

  public async get<T>(): Promise<T | null> {
    const content = (await browser.storage.sync.get(this.key)) as Record<string, T>;
    return content?.[this.key] ?? null;
  }

  public async set<T>(value: T): Promise<void> {
    await browser.storage.sync.set({ [this.key]: value });
  }

  public async clear(): Promise<void> {
    await browser.storage.sync.remove(this.key);
  }
}
