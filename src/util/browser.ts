import browser from "webextension-polyfill";

export const getLastActiveTabUrl = async (): Promise<URL | undefined> => {
  const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });

  return tab?.url ? new URL(tab.url) : undefined;
};

export const redirectToNewTab = async (url: string): Promise<void> => {
  await browser.tabs.create({ url });
};

export const getExtensionUrl = (path: string): string => browser.runtime.getURL(path);

export const downloadFile = (content: string, filename: string): Promise<void> => {
  const element = document.createElement("a");
  element.style.display = "none";
  element.setAttribute("href", content);
  element.setAttribute("download", filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  return Promise.resolve();
};

export const copyToClipboard = async (content: string): Promise<void> => {
  await navigator.clipboard.writeText(content);
};
