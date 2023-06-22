// TODO: convert to a seperate SDK provider package
import { CryptKeeperInjectedProvider } from "./sdk/Base";

declare global {
  interface Window {
    cryptkeeper: CryptKeeperInjectedProvider;
  }
}

export function initializeInjectedProvider(): CryptKeeperInjectedProvider {
  const injectedProvider = new CryptKeeperInjectedProvider();
  setGlobalInjectedPrivider(injectedProvider);
  window.addEventListener("message", injectedProvider.eventResponser);

  return injectedProvider;
}

export function setGlobalInjectedPrivider(injectedProvider: CryptKeeperInjectedProvider): void {
  window.cryptkeeper = injectedProvider;
  window.dispatchEvent(new Event(`cryptkeeper#initialized`));
}
