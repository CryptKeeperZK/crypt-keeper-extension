/* global self */
// @src Metamask https://github.com/MetaMask/metamask-extension/blob/develop/app/scripts/app-init.js

// TODO: importing scripts better using importScritps() check MM
import log from "loglevel";
import browser from "webextension-polyfill";

import { isDebugMode } from "@src/config/env";

import { importAllScripts } from "./shared/importScripts";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

declare global {
  // eslint-disable-next-line no-var,vars-on-top
  var isFirstTimeProfileLoaded: boolean | undefined;
  // eslint-disable-next-line no-var,vars-on-top
  var isCryptkeeperInjected: boolean | undefined;
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
 */
browser.runtime.onMessage.addListener(() => {
  importAllScripts();
});

browser.runtime.onStartup.addListener(() => {
  importAllScripts();
  globalThis.isFirstTimeProfileLoaded = true;
});
