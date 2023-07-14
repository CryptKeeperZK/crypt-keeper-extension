<<<<<<< HEAD
<<<<<<< HEAD
export function isTrueOffscreen(): boolean {
  return true;
=======
import log from "loglevel";
=======
>>>>>>> d40e7b5 (fix: run prettier)
import { RequestHandler } from "@cryptkeeperzk/types";
import log from "loglevel";
import browser, { Runtime } from "webextension-polyfill";

import { isDebugMode } from "@src/config/env";

import { OffscreenController } from "./Offscreen";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

const offscreenMessageListener = async (request: RequestHandler, sender: Runtime.MessageSender): Promise<unknown> => {
  log.debug("Inside Offscreen onMessage", request);

<<<<<<< HEAD
<<<<<<< HEAD
  const {
    method,
    payload,
    meta,
    source
  } = request;
<<<<<<< HEAD
  
>>>>>>> 367f6fc (feat: working on offscreen controller)
=======
=======
  offscreenController.initialize();
>>>>>>> e508eda (feat: generating SemaphoreProofs from the Offscreen in chrome platforms)

  const offscreenMessageListener = async (request: RequestHandler, sender: Runtime.MessageSender) => {
    log.debug("Inside Offscreen onMessage", request);

    if (request.source !== "offscreen") {
      return;
    }

    try {
      return await offscreenController.handle(request);
    } catch (e) {
      throw new Error("Proof gneeration is failed")
    } finally {
      browser.runtime.onMessage.removeListener(offscreenMessageListener);
    }
=======
  if (request.source !== "offscreen") {
    return;
>>>>>>> d40e7b5 (fix: run prettier)
  }
<<<<<<< HEAD
>>>>>>> 44e1165 (feat: working on offscreen controller)
}
=======
>>>>>>> e508eda (feat: generating SemaphoreProofs from the Offscreen in chrome platforms)

  try {
    const offscreenController = new OffscreenController();
    offscreenController.initialize();

    const result = await offscreenController.handle(request);
    return result;
  } catch (e) {
    throw new Error("Proof gneeration is failed");
  } finally {
    browser.runtime.onMessage.removeListener(offscreenMessageListener);
  }
};

try {
  browser.runtime.onMessage.addListener(offscreenMessageListener);
} catch (error) {
  log.error("CryptKeeper offscreen launching error!");
}
