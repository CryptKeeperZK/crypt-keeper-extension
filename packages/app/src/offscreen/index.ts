<<<<<<< HEAD
export function isTrueOffscreen(): boolean {
  return true;
=======
import log from "loglevel";
import { RequestHandler } from "@cryptkeeperzk/types";
import browser, { Runtime } from "webextension-polyfill";
import { isDebugMode } from "@src/config/env";
import { OffscreenController } from "./Offscreen";
import pushMessage from "@src/util/pushMessage";
import { RPCAction } from "@cryptkeeperzk/providers";
import BrowserUtils from "@src/background/controllers/browserUtils";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

try {
  const offscreenController = new OffscreenController();

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
  }
<<<<<<< HEAD
>>>>>>> 44e1165 (feat: working on offscreen controller)
}
=======
>>>>>>> e508eda (feat: generating SemaphoreProofs from the Offscreen in chrome platforms)

  browser.runtime.onMessage.addListener(offscreenMessageListener);
} catch (error) {
  log.error("CryptKeeper offscreen launching error!");
}
