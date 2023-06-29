import { CryptKeeperInjectedProvider } from "./CryptKeeperInjectedProvider";

/**
 * Extends the global Window interface to include CryptKeeper-related properties.
 */
declare global {
  /**
   * Represents the CryptKeeperInjectedProvider instance.
   */
  interface Window {
    /**
     * The CryptKeeperInjectedProvider instance.
     */
    cryptkeeper: CryptKeeperInjectedProvider;

    /**
     * Indicates whether CryptKeeper is injected.
     */
    isCryptkeeperInjected?: boolean;
  }
}

/**
 * Initializes the CryptKeeper provider within the CryptKeeper extension.
 * This function is meant to be used exclusively within the CryptKeeper extension.
 * @returns {CryptKeeperInjectedProvider} The initialized CryptKeeperInjectedProvider instance.
 */
export function initializeCryptKeeperProvider(): CryptKeeperInjectedProvider {
  const cryptkeeperInjectedProvider = new CryptKeeperInjectedProvider();
  window.cryptkeeper = cryptkeeperInjectedProvider;
  window.dispatchEvent(new Event(`cryptkeeper#initialized`));
  window.addEventListener("message", cryptkeeperInjectedProvider.eventResponser);

  return cryptkeeperInjectedProvider;
}

/**
 * Connects to the CryptKeeper extension by initializing an injected provider.
 * This function is meant to be used by applications to establish a connection with the CryptKeeper extension.
 * @returns {CryptKeeperInjectedProvider | undefined} A Promise that resolves to the connected CryptKeeperInjectedProvider instance, or undefined if the CryptKeeper extension is not installed.
 */
export async function cryptkeeperConnect(): Promise<CryptKeeperInjectedProvider | undefined> {
  return initializeCryptKeeperProvider().connect();
}
