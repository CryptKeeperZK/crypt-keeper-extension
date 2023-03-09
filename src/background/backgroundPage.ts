import "subworkers";
import "./shared/initGlobals";
import "./appInit";
import { browser } from "webextension-polyfill-ts";
import { Request } from "@src/types";
import ZkKeeperController from "./zkKeeper";
import log from "loglevel";
import { deferredPromise } from "@src/background/shared/utils";
import { isDebugMode } from "@src/config/env";
import { Runtime } from "webextension-polyfill";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

const {
  promise: isInitialized,
  resolve: resolveInitialization,
  reject: rejectInitialization,
} = deferredPromise<unknown>();

browser.runtime.onConnect.addListener(async remotePort => {
  log.debug("CryptKeeper onConnect Event, initializing...");
  await initialize(remotePort);
  await isInitialized;
  log.debug("CryptKeeper onConnect Event, initializing completed...");
});

async function initialize(remotePort: Runtime.Port) {
  try {
    const app = new ZkKeeperController();

    app.initialize(remotePort).then(() => {
      remotePort.onMessage.addListener(async (request: Request) => {
        try {
          log.debug("Background: request: ", request);
          await app.handle(request);
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
