import browser from "webextension-polyfill";

import type { IMessageAction } from "@cryptkeeperzk/types";

export default async function postMessage<T>(message: IMessageAction): Promise<T> {
  const [err, res] = (await browser.runtime.sendMessage({ ...message, meta: message.meta ? message.meta : {} })) as [
    string,
    T,
  ];

  if (err) {
    throw new Error(err);
  }

  return res;
}
