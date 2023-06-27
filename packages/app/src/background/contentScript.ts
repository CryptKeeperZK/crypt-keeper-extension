import log from "loglevel";
import browser from "webextension-polyfill";

import { setStatus } from "@src/ui/ducks/app";
import { setConnectedIdentity } from "@src/ui/ducks/identities";

import type { InjectedMessageData, ReduxAction, ConnectedIdentity } from "@cryptkeeper/types";

function injectScript() {
  const url = browser.runtime.getURL("js/injected.js");
  const container = document.head || document.documentElement;
  const scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.setAttribute("async", "false");
  container.insertBefore(scriptTag, container.children[0]);
  container.removeChild(scriptTag);

  window.addEventListener("message", (event: MessageEvent<InjectedMessageData>) => {
    const { data } = event;

    if (data && data.target === "injected-contentscript") {
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

  browser.runtime.onMessage.addListener((action: ReduxAction) => {
    switch (action.type) {
      case setConnectedIdentity.type: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, action.payload as ConnectedIdentity],
            nonce: "identityChanged",
          },
          "*",
        );
        return;
      }
      case setStatus.type: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null],
            nonce: !(action.payload as { isUnlocked: boolean }).isUnlocked ? "logout" : "login",
          },
          "*",
        );
        return;
      }
      default:
        log.warn("unknown action in content script");
    }
  });
}

try {
  injectScript();
} catch (e) {
  log.error("error occured", e);
}
