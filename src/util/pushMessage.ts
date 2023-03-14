import log from "loglevel";
import { Runtime } from "webextension-polyfill";
import { browser } from "webextension-polyfill-ts";

import { ReduxAction } from "@src/types";

let messageSender: MessageSender;

class MessageSender {
  public remotePort: Runtime.Port;

  constructor(remotePort: Runtime.Port) {
    this.remotePort = remotePort;
  }

  public send(message: ReduxAction) {
    try {
      this.remotePort.postMessage(message);
    } catch (error) {
      log.warn("Push message error: ", error);
    }
  }
}

export function messageSenderFactory(remotePort: Runtime.Port) {
  messageSender = new MessageSender(remotePort);
  Object.freeze(messageSender);
}

export default async function pushMessage(message: ReduxAction): Promise<void> {
  try {
    messageSender.send(message);
  } catch (error) {
    log.warn("Push message error: ", error);
  }
}
