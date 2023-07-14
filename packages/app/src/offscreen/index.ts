import { RequestHandler } from "@cryptkeeperzk/types";
import log from "loglevel";
import browser, { Runtime } from "webextension-polyfill";

import { isDebugMode } from "@src/config/env";

import { OffscreenController } from "./Offscreen";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

const offscreenMessageListener = async (request: RequestHandler, sender: Runtime.MessageSender) => {
  log.debug("Inside Offscreen onMessage", request);
  if (request.source !== "offscreen") {
    return;
  }

  try {
    const offscreenController = new OffscreenController();
    offscreenController.initialize();

    const result = await offscreenController.handle(request, sender);
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
