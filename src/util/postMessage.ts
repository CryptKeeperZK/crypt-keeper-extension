import type { MessageAction } from "@src/types";

import log from "loglevel";

import { Runtime } from "webextension-polyfill";

let messageSender: MessageSender;

class MessageSender {
  public remotePort: Runtime.Port;

  constructor(remotePort: Runtime.Port) {
    this.remotePort = remotePort;
  }

  public send(message: MessageAction) {
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

export default function postMessage(message: MessageAction) {
  messageSender.send(message);
}
