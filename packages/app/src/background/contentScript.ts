import log from "loglevel";
import browser from "webextension-polyfill";

import { setStatus } from "@src/ui/ducks/app";
import { setConnectedIdentity } from "@src/ui/ducks/identities";

import type { InjectedMessageData, ReduxAction, ConnectedIdentityMetadata } from "@cryptkeeperzk/types";

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
            payload: [null, action.payload as ConnectedIdentityMetadata],
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

  browser.runtime.onMessage.addListener((request: { action: string }) => {
    switch (request.action) {
      case "addVerifiableCredential": {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, (request as { action: string; verifiableCredentialHash: string }).verifiableCredentialHash],
            nonce: "addVerifiableCredential",
          },
          "*",
        );
        break;
      }
      case "rejectVerifiableCredential": {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null],
            nonce: "rejectVerifiableCredential",
          },
          "*",
        );
        break;
      }
      default:
    }
  });
}

try {
  injectScript();
} catch (e) {
  log.error("error occured", e);
}
