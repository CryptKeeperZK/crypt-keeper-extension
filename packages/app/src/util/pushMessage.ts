import log from "loglevel";
import browser from "webextension-polyfill";

import { ReduxAction, RequestHandler } from "@src/types";

export default async function pushMessage(message: ReduxAction | RequestHandler): Promise<unknown> {
  try {
    return await browser.runtime.sendMessage(message);
  } catch (error) {
    log.warn("Push message error: ", error);
  }
}
