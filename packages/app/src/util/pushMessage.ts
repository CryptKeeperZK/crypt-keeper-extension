import { IReduxAction, IRequestHandler } from "@cryptkeeperzk/types";
import pick from "lodash/pick";
import log from "loglevel";
import browser from "webextension-polyfill";

export default async function pushMessage(message: IReduxAction | IRequestHandler): Promise<unknown> {
  try {
    const result: unknown = await browser.runtime.sendMessage(message);
    return result;
  } catch (error) {
    log.warn("PushMessage error: ", error);
    log.warn("PushMessage request: ", pick(message, ["method", "meta", "error"]));
    return undefined;
  }
}
