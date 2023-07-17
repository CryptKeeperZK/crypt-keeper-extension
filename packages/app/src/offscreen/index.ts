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
    // eslint-disable-next-line consistent-return
    return offscreenController.handle(request, sender);
  } catch (e) {
    log.error("CryptKeeper offscreen error!", e);
    throw new Error("Proof generation is failed");
  } finally {
    browser.runtime.onMessage.removeListener(offscreenMessageListener);
  }
};

browser.runtime.onMessage.addListener(offscreenMessageListener);
