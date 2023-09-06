import { EventName } from "@cryptkeeperzk/providers";
import log from "loglevel";
import browser from "webextension-polyfill";

import { setStatus } from "@src/ui/ducks/app";
import { setConnectedIdentity } from "@src/ui/ducks/identities";

import type { IInjectedMessageData, IReduxAction, ConnectedIdentityMetadata } from "@cryptkeeperzk/types";

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

  browser.runtime.onMessage.addListener((action: IReduxAction) => {
    switch (action.type) {
      case setConnectedIdentity.type: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, action.payload as ConnectedIdentityMetadata],
            nonce: EventName.IDENTITY_CHANGED,
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
            nonce: !(action.payload as { isUnlocked: boolean }).isUnlocked ? EventName.LOGOUT : EventName.LOGIN,
          },
          "*",
        );
        return;
      }
      case EventName.ADD_VERIFIABLE_CREDENTIAL: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, (action.payload as { verifiableCredentialHash: string }).verifiableCredentialHash],
            nonce: EventName.ADD_VERIFIABLE_CREDENTIAL,
          },
          "*",
        );
        break;
      }
      case EventName.REJECT_VERIFIABLE_CREDENTIAL: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null],
            nonce: EventName.REJECT_VERIFIABLE_CREDENTIAL,
          },
          "*",
        );
        break;
      }
      case EventName.REVEAL_COMMITMENT: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, action.payload as { commitment: string }],
            nonce: EventName.REVEAL_COMMITMENT,
          },
          "*",
        );
        break;
      }
      default:
        log.warn("unknown action in content script");
    }
  });
}

try {
  injectScript();
} catch (e) {
  log.error("error occurred", e);
}
