// TODO: importing scripts better using importScritps() check MM 
import importAllScripts from "./shared/importScripts.js"

// Ref: https://stackoverflow.com/questions/66406672/chrome-extension-mv3-modularize-service-worker-js-file
// eslint-disable-next-line no-undef
self.addEventListener('install', importAllScripts);

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
  globalThis.isFirstTimeProfileLoaded = true;
});

import 'subworkers'; 
import { browser, Runtime } from "webextension-polyfill-ts";
import { Request } from "@src/types";
import ZkKeeperController from "./zk-keeper";
import { isManifestV3 } from './shared/checkManifestV3';
import log from 'loglevel';
import { checkForLastErrorAndLog } from "./shared/checForLastError";

globalThis.CRYPTKEEPER_DEBUG = true;

log.setDefaultLevel(globalThis.CRYPTKEEPER_DEBUG ? 'debug' : 'info');

/**
 * @src MetaMask extension workaround
 * Sends a message to the dapp(s) content script to signal it can connect to MetaMask background as
 * the backend is not active. It is required to re-connect dapps after service worker re-activates.
 * For non-dapp pages, the message will be sent and ignored.
 */
 const ONE_SECOND_IN_MILLISECONDS = 1_000;
 // Timeout for initializing phishing warning page.
 const PHISHING_WARNING_PAGE_TIMEOUT = ONE_SECOND_IN_MILLISECONDS;
 
 const ACK_KEEP_ALIVE_MESSAGE = 'ACK_KEEP_ALIVE_MESSAGE';
 const WORKER_KEEP_ALIVE_MESSAGE = 'WORKER_KEEP_ALIVE_MESSAGE';

 const sendReadyMessageToTabs = async () => {
  const tabs = await browser.tabs
    .query({
      /**
       * Only query tabs that our extension can run in. To do this, we query for all URLs that our
       * extension can inject scripts in, which is by using the "<all_urls>" value and __without__
       * the "tabs" manifest permission. If we included the "tabs" permission, this would also fetch
       * URLs that we'd not be able to inject in, e.g. chrome://pages, chrome://extension, which
       * is not what we'd want.
       *
       * You might be wondering, how does the "url" param work without the "tabs" permission?
       *
       * @see {@link https://bugs.chromium.org/p/chromium/issues/detail?id=661311#c1}
       *  "If the extension has access to inject scripts into Tab, then we can return the url
       *   of Tab (because the extension could just inject a script to message the location.href)."
       */
      url: '<all_urls>',
      windowType: 'normal',
    })
    .then((result) => {
      checkForLastErrorAndLog();
      return result;
    })
    .catch(() => {
      checkForLastErrorAndLog();
    });

  /** @todo we should only sendMessage to dapp tabs, not all tabs. */
  // for (const tab of tabs) {
  //   browser.tabs
  //     .sendMessage(tab.id, {
  //       name: EXTENSION_MESSAGES.READY,
  //     })
  //     .then(() => {
  //       checkForLastErrorAndLog();
  //     })
  //     .catch(() => {
  //       // An error may happen if the contentscript is blocked from loading,
  //       // and thus there is no runtime.onMessage handler to listen to the message.
  //       checkForLastErrorAndLog();
  //     });
  // }
};

// TODO consider adding inTest env
const initApp = async (remotePort?: Runtime.Port) => {
  browser.runtime.onConnect.removeListener(initApp);
  await initialize(remotePort);
  await sendReadyMessageToTabs();
  log.debug('CryptKeeper initialization complete.');
}

if (isManifestV3) {
  browser.runtime.onConnect.addListener(initApp);
} else {
  initialize().catch(log.error);   
}

async function initialize (remotePort?: Runtime.Port) {
  if (remotePort) {
    try {
      log.debug(`initialize remotePort`, remotePort);
      const app: ZkKeeperController = new ZkKeeperController();

      app.initialize().then(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        browser.runtime.onMessage.addListener(async (request: Request,_) => {
          try {
            log.debug("Background 1: request: ", request)
            const res = await app.handle(request);
            return [null, res];
          } catch (e: any) {
            return [e.message, null];
          }
        });
        
        // remotePort.onMessage.addListener((message: any) => {
        //   log.debug(`remotePort.onMessage: ${message}`);
        //   if (message.name === WORKER_KEEP_ALIVE_MESSAGE) {
        //     remotePort.postMessage({ name: ACK_KEEP_ALIVE_MESSAGE });
        //   }
        // });
        //browser.runtime.onMessage.addListener();
    
        // TODO: change to BrowserUtils
        // TODO: open a setup page in the installation of the extension (one-time use)
        // browser.runtime.onInstalled.addListener(async ({ reason }) => {
        //   log.debug("Inside browser.runtime.connect().onInstalled");
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
