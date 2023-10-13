import type { ICryptKeeperInjectedProvider } from "./interface";

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
 * @returns {CryptKeeperInjectedProvider | undefined} The initialized CryptKeeperInjectedProvider instance or undefined.
 */
export function initializeCryptKeeperProvider(connectedOrigin?: string): ICryptKeeperInjectedProvider {
  const cryptkeeperInjectedProvider = new CryptKeeperInjectedProvider(connectedOrigin);
  window.cryptkeeper = cryptkeeperInjectedProvider;
  window.dispatchEvent(new Event(`cryptkeeper#initialized`));
  window.addEventListener("message", cryptkeeperInjectedProvider.eventResponser);

  return cryptkeeperInjectedProvider;
}

/**
 * Initializes the CryptKeeper provider within the connected application.
 * This function is meant to be used exclusively within the CryptKeeper extension.
 * @returns {CryptKeeperInjectedProvider | undefined} A connected CryptKeeperInjectedProvider instance, or undefined if the CryptKeeper extension is not installed.
 */
export function initializeCryptKeeper(): ICryptKeeperInjectedProvider | undefined {
  if (!window.isCryptkeeperInjected) {
    return undefined;
  }

  return initializeCryptKeeperProvider(window.location.origin);
}
