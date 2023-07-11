import log from "loglevel";
import "subworkers";
import browser from "webextension-polyfill";

import CryptKeeperController from "@src/background/cryptKeeper";
import { createChromeOffscreen, deferredPromise, getBrowserPlatform } from "@src/background/shared/utils";
import { isDebugMode } from "@src/config/env";
import { BROWSER_PLATFORM_FIREFOX } from "@src/constants";
import { RequestHandler } from "@src/types";

import "./appInit";
import "./shared/initGlobals";

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
  const browserPlatform = getBrowserPlatform();
  const app = new CryptKeeperController();

  app.initialize();

  browser.runtime.onMessage.addListener(async (request: RequestHandler) => {
    log.debug("Background: request: ", request);

    if (browserPlatform !== BROWSER_PLATFORM_FIREFOX && request.isOffscreen) {
      await createChromeOffscreen();
    }

    try {
      const response = await app.handle(request);
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
