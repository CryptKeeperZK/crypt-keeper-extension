// @src Metamask https://github.com/MetaMask/metamask-extension/blob/develop/app/scripts/app-init.js

// TODO: importing scripts better using importScritps() check MM
import importAllScripts from "./shared/importScripts";

declare global {
  // eslint-disable-next-line no-var
  var isFirstTimeProfileLoaded: boolean | undefined;
}

// Ref: https://stackoverflow.com/questions/66406672/chrome-extension-mv3-modularize-service-worker-js-file
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
