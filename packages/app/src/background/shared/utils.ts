import {
  BROWSER_PLATFORM_BRAVE,
  BROWSER_PLATFORM_CHROME,
  BROWSER_PLATFORM_EDGE,
  BROWSER_PLATFORM_FIREFOX,
  BROWSER_PLATFORM_OPERA,
} from "@src/constants";
import { DeferredPromise } from "@src/types";

/**
 * @src Metamask extension
 * A deferred Promise.
 *
 * A deferred Promise is one that can be resolved or rejected independently of
 * the Promise construction.
 *
 * @typedef {object} DeferredPromise
 * @property {Promise} promise - The Promise that has been deferred.
 * @property {() => void} resolve - A function that resolves the Promise.
 * @property {() => void} reject - A function that rejects the Promise.
 */

/**
 * Create a defered Promise.
 *
 * @returns {DeferredPromise} A deferred Promise.
 */
export function deferredPromise<T>(): DeferredPromise<T> {
  let resolve: DeferredPromise<T>["resolve"];
  let reject: DeferredPromise<T>["reject"];

  const promise: Promise<T> = new Promise((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return { promise, resolve, reject };
}

/**
 * Returns the platform (browser) where the extension is running.
 *
 * @returns {string} the platform ENUM
 */
export function getBrowserPlatform(): string {
  const { navigator: browserNavigator } = window;
  const { userAgent } = navigator;

  if (userAgent.includes("Firefox")) {
    return BROWSER_PLATFORM_FIREFOX;
  }
  if ("brave" in browserNavigator) {
    return BROWSER_PLATFORM_BRAVE;
  }
  if (userAgent.includes("Edg/")) {
    return BROWSER_PLATFORM_EDGE;
  }
  if (userAgent.includes("OPR/")) {
    return BROWSER_PLATFORM_OPERA;
  }
  return BROWSER_PLATFORM_CHROME;
}

/**
 * Creates a Chrome offscreen document for generating zero-knowledge proofs (ZKP).
 * If an offscreen document already exists, this function does nothing.
 * If an offscreen document does not exist, it creates a new one with the specified URL, reasons, and justification.
 * @returns {Promise<void>} A promise that resolves when the offscreen document is created or if it already exists.
 */
export async function createChromeOffscreen(): Promise<void> {
  if (await chrome.offscreen.hasDocument()) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
    justification: "Cryptkeeper Offscrreen for generating ZKP",
  });
}
