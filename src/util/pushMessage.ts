import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

import { ReduxAction } from "@src/types";

export default async function pushMessage(message: ReduxAction): Promise<void> {
  try {
    await browser.runtime.sendMessage(message);
  } catch (error) {
    log.warn("Push message error: ", error);
  }
}
