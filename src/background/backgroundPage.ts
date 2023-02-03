import "./appInit";
import 'subworkers'; 
import { browser, Runtime } from "webextension-polyfill-ts";
import { Request } from "@src/types";
import ZkKeeperController from "./zk-keeper";
import log from 'loglevel';
import { checkForLastErrorAndLog } from "./shared/checForLastError";

globalThis.CRYPTKEEPER_DEBUG = false;

log.setDefaultLevel(globalThis.CRYPTKEEPER_DEBUG ? 'debug' : 'info');

browser.runtime.onInstalled.addListener(async args => {
  log.debug("CryptKeeper onInstalled Event, initializing...");
  await initApp();
  log.debug("CryptKeeper onInstalled Event, initializing completed...");
});

browser.runtime.onConnect.addListener(async args => {
  log.debug("CryptKeeper onConnect Event, initializing...");
  await initApp();
  log.debug("CryptKeeper onConnect Event, initializing completed...");
});

const initApp = async (remotePort?: Runtime.Port) => {
  browser.runtime.onConnect.removeListener(initApp);
  await initialize(remotePort);
  await sendReadyMessageToTabs();
  log.debug('CryptKeeper initialization complete.');
}

async function initialize (remotePort?: Runtime.Port) {
  try {
    log.debug(`initialize remotePort`, remotePort);
    const app: ZkKeeperController = new ZkKeeperController();

    app.initialize().then(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      browser.runtime.onMessage.addListener(async (request: Request,_) => {
        try {
          log.debug("Background: request: ", request)
          const response = await app.handle(request);
          log.debug("Background: response: ", response);
          return [null, response];
        } catch (e: any) {
          return [e.message, null];
        }
      });
    });
  } catch (error) {
    log.error("Error in backgound!", error);
  }
}

const sendReadyMessageToTabs = async () => {
  await browser.tabs
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
};