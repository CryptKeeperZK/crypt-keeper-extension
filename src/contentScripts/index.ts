import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

import { InjectedMessageData, ReduxAction } from "@src/types";
import { ActionType as AppActionType } from "@src/ui/ducks/app";
import { ActionType as IdentityActionType } from "@src/ui/ducks/identities";

try {
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
      case IdentityActionType.SET_SELECTED: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, action.payload],
            nonce: "identityChanged",
          },
          "*",
        );
        return;
      }
      case AppActionType.SET_STATUS: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null],
            nonce: !(action.payload as { unlocked: boolean }).unlocked ? "logout" : "login",
          },
          "*",
        );
        return;
      }
      default:
        log.warn("unknown action in content script");
    }
  });
} catch (e) {
  log.error("error occured", e);
}
