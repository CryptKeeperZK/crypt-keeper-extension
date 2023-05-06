// TODO: convert to a seperate SDK provider package
import log from "loglevel";

import { isDebugMode } from "@src/config/env";

import { CryptKeeperInjectedProvider } from "./providers/Base";

declare global {
  interface Window {
    cryptkeeper?: CryptKeeperInjectedProvider;
  }
}

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

function initializeInjectedProvider(): void {
  const injectedProvider = new CryptKeeperInjectedProvider();
  setGlobalInjectedPrivider(injectedProvider);
  window.addEventListener("message", injectedProvider.eventResponser);
}

function setGlobalInjectedPrivider(injectedProvider: CryptKeeperInjectedProvider): void {
  window.cryptkeeper = injectedProvider;
  window.dispatchEvent(new Event(`CryptKeeper Injected Provider has been succssfully intialized.`));
}

try {
  initializeInjectedProvider();
} catch (error) {
  log.error(`Error in injecting CryptKeeper Injected Provider`);
}
