import { MetaMaskInpageProvider } from "@metamask/providers";
import { detect } from "detect-browser";
import PortStream from "extension-port-stream";
import { browser } from "webextension-polyfill-ts";

import type { Duplex } from "stream";

export function createMetamaskProvider(extensionId?: string): MetaMaskInpageProvider {
  const currentMetaMaskId = extensionId || getMetaMaskId();
  const metamaskPort = browser.runtime.connect(currentMetaMaskId);
  const pluginStream = new PortStream(metamaskPort);

  return new MetaMaskInpageProvider(pluginStream as unknown as Duplex);
}

const CONFIG = {
  CHROME_ID: "nkbihfbeogaeaoehlefnkodbefgpgknn",
  FIREFOX_ID: "webextension@metamask.io",
};

function getMetaMaskId() {
  switch (detect()?.name) {
    case "chrome":
      return CONFIG.CHROME_ID;
    case "firefox":
      return CONFIG.FIREFOX_ID;
    default:
      return CONFIG.CHROME_ID;
  }
}
