// TODO: importing scripts better using importScritps() check MM 
import 'subworkers'; 
import { browser, Runtime } from "webextension-polyfill-ts";
import { Request } from "@src/types";
import ZkKeeperController from "./zk-keeper";
import RPCAction from "@src/util/constants";
import { isManifestV3 } from './shared/checkManifestV3';
import log from 'loglevel';

log.setDefaultLevel(process.env.CRYPTKEEPER_DEBUG ? 'debug' : 'info');

// TODO consider adding inTest env
const app: ZkKeeperController = new ZkKeeperController();

const initApp = async (remotePort?: chrome.runtime.Port) => {
  chrome.runtime.onConnect.removeListener(initApp);
  await initialize(remotePort);
  log.info('CryptKeeper initialization complete.');
}

if (isManifestV3) {
  chrome.runtime.onConnect.addListener(initApp);
} else {
  initialize().catch(log.error);   
}

async function initialize (remotePort?: chrome.runtime.Port) {
  if (remotePort) {
    try {
      // TODO: just added to check the difference in testing
      // chrome.runtime.onInstalled.addListener(async () => {
      //   try {
      //     console.log("Extension is installed")
      //   } catch (e) {
      //     console.log("Extension is not installed");
      //   }
      // });
      app.initialize().then(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remotePort.onMessage.addListener(async (request: Request, _) => {
          try {
            console.log("Background 1: request: ", request)
            const res = await app.handle(request);
            return [null, res];
          } catch (e: any) {
            console.log("Background 2: request: ", request)
            console.log("ERROR!!!!!!!!!")
            return [e.message, null];
          }
        });
        //browser.runtime.onMessage.addListener();
    
        // TODO: change to BrowserUtils
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
      console.log("Error in backgound!!1");
    }
  } else {
    log.error("remotePort is not initalized");
  }
}
