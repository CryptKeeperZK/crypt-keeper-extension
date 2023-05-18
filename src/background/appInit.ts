/* global self */
// @src Metamask https://github.com/MetaMask/metamask-extension/blob/develop/app/scripts/app-init.js

// TODO: importing scripts better using importScritps() check MM
import log from "loglevel";

import { isDebugMode } from "@src/config/env";

import { importAllScripts } from "./shared/importScripts";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

declare global {
  // eslint-disable-next-line no-var,vars-on-top
  var isFirstTimeProfileLoaded: boolean | undefined;
}

// Ref: https://stackoverflow.com/questions/66406672/chrome-extension-mv3-modularize-service-worker-js-file
// eslint-disable-next-line no-restricted-globals
self.addEventListener("install", () => {
  importAllScripts();
});

/*
 * @src MetaMask extension workaround
 * A keepalive message listener to prevent Service Worker getting shut down due to inactivity.
 * UI sends the message periodically, in a setInterval.
 * Chrome will revive the service worker if it was shut down, whenever a new message is sent, but only if a listener was defined here.
 *
 * chrome below needs to be replaced by cross-browser object,
 * but there is issue in importing webextension-polyfill into service worker.
 * chrome does seems to work in at-least all chromium based browsers
 */
chrome.runtime.onMessage.addListener(() => {
  importAllScripts();
  return false;
});

chrome.runtime.onStartup.addListener(() => {
  importAllScripts();
  globalThis.isFirstTimeProfileLoaded = true;
});

/*
 * This content script is injected programmatically because
 * MAIN world injection does not work properly via manifest
 * https://bugs.chromium.org/p/chromium/issues/detail?id=634381
 */
const registerInjectedScript = async () => {
  try {
    await chrome.scripting.registerContentScripts([
      {
        id: "injectedProvider",
        matches: ["file://*/*", "http://*/*", "https://*/*"],
        js: ["js/injected.js"],
        runAt: "document_start",
        world: "MAIN",
      },
    ]);
  } catch (err: unknown | string) {
    /**
     * An error occurs when app-init.js is reloaded. Attempts to avoid the duplicate script error:
     * 1. registeringContentScripts inside runtime.onInstalled - This caused a race condition
     *    in which the provider might not be loaded in time.
     * 2. await chrome.scripting.getRegisteredContentScripts() to check for an existing
     *    inpage script before registering - The provider is not loaded on time.
     */
    log.warn("Dropped attempt to register inpage content script.", err);
  }
};

registerInjectedScript();
