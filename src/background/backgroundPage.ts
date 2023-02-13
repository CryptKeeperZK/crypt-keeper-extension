import "subworkers";
import "./appInit";
import { browser } from "webextension-polyfill-ts";
import { Request } from "@src/types";
import ZkKeeperController from "./zk-keeper";
import log from "loglevel";
import { deferredPromise } from "@src/background/shared/utils";

globalThis.CRYPTKEEPER_DEBUG = true;

log.setDefaultLevel(globalThis.CRYPTKEEPER_DEBUG ? "debug" : "info");

const {
  promise: isInitialized,
  resolve: resolveInitialization,
  reject: rejectInitialization,
} = deferredPromise<unknown>();

browser.runtime.onInstalled.addListener(async () => {
  log.debug("CryptKeeper onInstalled Event, initializing...");
  await isInitialized;
  log.debug("CryptKeeper onInstalled Event, initializing completed...");
});

browser.runtime.onConnect.addListener(async () => {
  log.debug("CryptKeeper onConnect Event, initializing...");
  await isInitialized;
  log.debug("CryptKeeper onConnect Event, initializing completed...");
});

initialize().catch((e: any) => {
  log.error("CryptKeeper Initializaiton error.", e);
});

async function initialize() {
  try {
    const app: ZkKeeperController = new ZkKeeperController();

    app.initialize().then(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      browser.runtime.onMessage.addListener(async (request: Request, _) => {
        try {
          log.debug("Background: request: ", request);
          const response = await app.handle(request);
          log.debug("Background: response: ", response);
          return [null, response];
        } catch (e: any) {
          return [e.message, null];
        }
      });
    });
    log.debug("CryptKeeper initialization complete.");
    resolveInitialization?.(true);
  } catch (error) {
    rejectInitialization?.(error);
  }
}
