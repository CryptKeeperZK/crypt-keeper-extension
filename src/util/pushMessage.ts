import { browser } from "webextension-polyfill-ts";
import log from "loglevel";

import { ReduxAction } from "@src/types";

export default async function pushMessage(message: ReduxAction) {
  try {
    await browser.runtime.sendMessage(message);
  } catch (error) {
    log.warn("Push message error: ", error);
  }
}
