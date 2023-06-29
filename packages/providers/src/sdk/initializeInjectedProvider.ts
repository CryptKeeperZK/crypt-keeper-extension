import { CryptKeeperInjectedProvider } from "./CryptKeeperInjectedProvider";

declare global {
  interface Window {
    cryptkeeper: CryptKeeperInjectedProvider;
    isCryptkeeperInjected?: boolean;
  }
}

export function initializeInjectedProvider(): CryptKeeperInjectedProvider {
  const injectedProvider = new CryptKeeperInjectedProvider();
  window.cryptkeeper = injectedProvider;
  window.dispatchEvent(new Event(`cryptkeeper#initialized`));
  window.addEventListener("message", injectedProvider.eventResponser);

  return injectedProvider;
}
