import log from "loglevel";
import browser from "webextension-polyfill";

import { ReduxAction, RequestHandler } from "@src/types";

export default async function pushMessage(message: ReduxAction | RequestHandler): Promise<unknown> {
  try {
    const result = (await browser.runtime.sendMessage(message)) as unknown;
    return result;
  } catch (error) {
    log.warn("Push message error: ", error);
    return undefined;
  }
}
