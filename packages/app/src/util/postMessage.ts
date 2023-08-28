import browser from "webextension-polyfill";

import type { MessageAction } from "@cryptkeeperzk/types";

export default async function postMessage<T>(message: MessageAction): Promise<T> {
  const [err, res] = (await browser.runtime.sendMessage(message)) as [string, T];

  if (err) {
    throw new Error(err);
  }

  return res;
}
