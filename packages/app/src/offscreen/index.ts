<<<<<<< HEAD
export function isTrueOffscreen(): boolean {
  return true;
=======
import log from "loglevel";
import { RequestHandler } from "@cryptkeeperzk/types";
import browser, { Runtime } from "webextension-polyfill";
import { isDebugMode } from "@src/config/env";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

const offscreenMessageListener = async (request: RequestHandler, sender: Runtime.MessageSender) => {
  log.debug("Inside Offscreen onMessage", request);

  const {
    method,
    payload,
    meta,
    source
  } = request;
<<<<<<< HEAD
  
>>>>>>> 367f6fc (feat: working on offscreen controller)
=======

  if (source !== "offscreen") {
    return;
  }
>>>>>>> 44e1165 (feat: working on offscreen controller)
}

browser.runtime.onMessage.addListener(offscreenMessageListener);
