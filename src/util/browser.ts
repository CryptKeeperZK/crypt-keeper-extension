import { browser } from "webextension-polyfill-ts";

export const getLastActiveTabUrl = async (): Promise<URL | undefined> => {
  const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });

  return tab?.url ? new URL(tab.url) : undefined;
};

export const redirectToNewTab = async (url: string): Promise<void> => {
  await browser.tabs.create({ url });
};
