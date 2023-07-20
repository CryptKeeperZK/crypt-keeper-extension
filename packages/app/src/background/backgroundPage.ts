import log from "loglevel";
import browser, { type Runtime } from "webextension-polyfill";

import "@src/background/appInit";
import CryptKeeperController from "@src/background/cryptKeeper";
import { deferredPromise } from "@src/background/shared/utils";
import { isDebugMode } from "@src/config/env";
import { RequestHandler } from "@src/types";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

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

try {
  const app = new CryptKeeperController();

  app.initialize();

  browser.runtime.onMessage.addListener(async (request: RequestHandler, sender: Runtime.MessageSender) => {
    log.debug("Background: request: ", request);

    try {
      const response = await app.handle(request, sender);
      log.debug("Background: response: ", response);
      return [null, response];
    } catch (e) {
      return [(e as Error).message, null];
    }
  });

  log.debug("CryptKeeper initialization complete.");
  resolveInitialization?.(true);
} catch (error) {
  rejectInitialization?.(error);
}
