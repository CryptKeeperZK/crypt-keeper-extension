import browser, { type Runtime } from "webextension-polyfill";

import type { IRequestHandler } from "@cryptkeeperzk/types";

import { OffscreenController } from "./Offscreen";

const offscreenMessageListener = async (request: IRequestHandler, sender: Runtime.MessageSender) => {
  if (request.source !== "offscreen") {
    return undefined;
  }

  try {
    // TODO: offscreen controller is created on each request
    const offscreenController = new OffscreenController();
    offscreenController.initialize();
    return offscreenController.handle(request, sender);
  } catch (error) {
    throw new Error(`Proof generation is failed ${(error as Error).message}`);
  } finally {
    browser.runtime.onMessage.removeListener(offscreenMessageListener);
  }
};

browser.runtime.onMessage.addListener(offscreenMessageListener);
