import { EventName } from "@cryptkeeperzk/providers";
import log from "loglevel";
import browser from "webextension-polyfill";

import { setStatus } from "@src/ui/ducks/app";

import type { IInjectedMessageData, IReduxAction } from "@cryptkeeperzk/types";

function injectScript() {
  const url = browser.runtime.getURL("js/injected.js");
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const container = document.head || document.documentElement;
  const scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.setAttribute("async", "false");
  container.insertBefore(scriptTag, container.children[0]);
  container.removeChild(scriptTag);

  window.addEventListener("message", (event: MessageEvent<IInjectedMessageData>) => {
    const { data } = event;

    if (data.target === "injected-contentscript") {
      browser.runtime.sendMessage(data.message).then((res: unknown) => {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: res,
            nonce: data.nonce,
          },
          "*",
        );
      });
    }
  });

  browser.runtime.onMessage.addListener(({ type, payload }: IReduxAction) => {
    switch (type) {
      case setStatus.type: {
        const { isUnlocked } = payload as { isUnlocked: boolean };
        const nonce = !isUnlocked ? EventName.LOGOUT : EventName.LOGIN;
        window.postMessage({ target: "injected-injectedscript", payload: [null], nonce }, "*");
        return;
      }
      default: {
        window.postMessage({ target: "injected-injectedscript", payload: [null, payload], nonce: type }, "*");
      }
    }
  });
}

try {
  injectScript();
} catch (e) {
  log.error("error occurred", e);
}
