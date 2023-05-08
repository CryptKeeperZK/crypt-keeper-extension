// TODO: convert to a seperate SDK provider package
import { CryptKeeperInjectedProvider } from "./sdk/Base";

declare global {
  interface Window {
      cryptkeeper: CryptKeeperInjectedProvider;
  }
}

export function initializeInjectedProvider(): void {
  const injectedProvider = new CryptKeeperInjectedProvider();
  setGlobalInjectedPrivider(injectedProvider);
  window.addEventListener("message", injectedProvider.eventResponser);
}

export function setGlobalInjectedPrivider(injectedProvider: CryptKeeperInjectedProvider): void {
  window.cryptkeeper = injectedProvider;
  window.dispatchEvent(new Event(`CryptKeeper Injected Provider has been succssfully intialized.`));
}
