/* global self */
// @src Metamask https://github.com/MetaMask/metamask-extension/blob/develop/app/scripts/app-init.js

// TODO: importing scripts better using importScritps() check MM
import log from "loglevel";
import browser from "webextension-polyfill";

import { importAllScripts } from "@src/background/shared/importScripts";
import "@src/background/shared/initGlobals";
import "@src/background/shared/subworkers";
import { isDebugMode } from "@src/config/env";

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

browser.runtime.onMessage.addListener(() => {
  importAllScripts();
});

browser.runtime.onStartup.addListener(() => {
  importAllScripts();
  globalThis.isFirstTimeProfileLoaded = true;
});
