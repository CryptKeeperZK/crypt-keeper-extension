// TODO: importing scripts better using importScritps() check MM 
import importAllScripts from "./shared/importScripts.js"

// Ref: https://stackoverflow.com/questions/66406672/chrome-extension-mv3-modularize-service-worker-js-file
// eslint-disable-next-line no-undef
self.addEventListener('install', importAllScripts);

/*
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
  globalThis.isFirstTimeProfileLoaded = true;
});

import 'subworkers'; 
import { browser, Runtime } from "webextension-polyfill-ts";
import { Request } from "@src/types";
import ZkKeeperController from "./zk-keeper";
import { isManifestV3 } from './shared/checkManifestV3';
import log from 'loglevel';

log.setDefaultLevel(process.env.CRYPTKEEPER_DEBUG ? 'debug' : 'info');

// TODO consider adding inTest env
const initApp = async (remotePort?: Runtime.Port) => {
  browser.runtime.onConnect.removeListener(initApp);
  await initialize(remotePort);
  log.info('CryptKeeper initialization complete.');
}

if (isManifestV3) {
  browser.runtime.onConnect.addListener(initApp);
} else {
  initialize().catch(log.error);   
}

async function initialize (remotePort?: Runtime.Port) {
  if (remotePort) {
    try {
      console.log(`initialize remotePort`, remotePort);
      const app: ZkKeeperController = new ZkKeeperController();

      app.initialize().then(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        browser.runtime.onMessage.addListener(async (request: Request,_) => {
          try {
            console.log("Background 1: request: ", request)
            const res = await app.handle(request);
            return [null, res];
          } catch (e: any) {
            return [e.message, null];
          }
        });
        //browser.runtime.onMessage.addListener();
    
        // TODO: change to BrowserUtils
        // TODO: open a setup page in the installation of the extension (one-time use)
        // browser.runtime.onInstalled.addListener(async ({ reason }) => {
        //   console.log("Inside browser.runtime.connect().onInstalled");
        //   if (reason === "install") {
        //     // TODO open html where password will be interested
        //     // browser.tabs.create({
        //     //   url: 'popup.html'
        //     // });
        //   }
        //   if (process.env.NODE_ENV === "development") {
        //     // browser.tabs.create({ url: 'popup.html' });
        //   }
        // });
      });
    } catch (error) {
      log.error("Error in backgound!", error);
    }
  } else {
    log.error("remotePort is not initalized");
  }
}
