import { BrowserPlatform } from "@src/constants";
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
  const { userAgent } = window.navigator;

  if (userAgent.includes("Firefox")) {
    return BrowserPlatform.Firefox;
  }

  if ("brave" in window.navigator) {
    return BrowserPlatform.Brave;
  }

  if (userAgent.includes("Edg/")) {
    return BrowserPlatform.Edge;
  }

  if (userAgent.includes("OPR/")) {
    return BrowserPlatform.Opera;
  }

  return BrowserPlatform.Chrome;
}

/**
 * Creates a Chrome offscreen document for generating zero-knowledge proofs (ZKP).
 * If an offscreen document already exists, this function does nothing.
 * If an offscreen document does not exist, it creates a new one with the specified URL, reasons, and justification.
 * @returns {Promise<void>} A promise that resolves when the offscreen document is created or if it already exists.
 */
export async function createChromeOffscreen(): Promise<void> {
  const isOffscreenAvaiable = await chrome.offscreen.hasDocument();

  if (isOffscreenAvaiable) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
    justification: "Cryptkeeper Offscrreen for generating ZKP",
  });
}
