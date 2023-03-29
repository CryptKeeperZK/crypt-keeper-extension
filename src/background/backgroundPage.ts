import log from "loglevel";
import "subworkers";
import { browser } from "webextension-polyfill-ts";

import { deferredPromise } from "@src/background/shared/utils";
import { isDebugMode } from "@src/config/env";
import { HandlerRequest } from "@src/types";

import "./appInit";
import "./shared/initGlobals";
import ZkKeeperController from "./zkKeeper";

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

function initialize() {
  try {
    const app = new ZkKeeperController();

    app.initialize();

    browser.runtime.onMessage.addListener(async (request: HandlerRequest) => {
      try {
        log.debug("Background: request: ", request);
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
}

initialize();
