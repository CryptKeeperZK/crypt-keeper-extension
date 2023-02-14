import { MessageAction } from "@src/types";
import { browser } from "webextension-polyfill-ts";

export default async function postMessage(message: MessageAction) {
  const [err, res] = await browser.runtime.sendMessage(message);

  if (err) {
    throw new Error(err);
  }

  return res;
}
