import pick from "lodash/pick";
import log from "loglevel";
import browser from "webextension-polyfill";

import { ReduxAction, RequestHandler } from "@src/types";

export default async function pushMessage(message: ReduxAction | RequestHandler): Promise<unknown> {
  try {
    const result: unknown = await browser.runtime.sendMessage(message);
    return result;
  } catch (error) {
    log.warn("PushMessage error: ", error);
    log.warn("PushMessage request: ", pick(message, ["method", "meta", "error"]));
    return undefined;
  }
}
