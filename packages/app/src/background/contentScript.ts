import { EventName } from "@cryptkeeperzk/providers";
import log from "loglevel";
import browser from "webextension-polyfill";

import type {
  IInjectedMessageData,
  IReduxAction,
  IRejectedRequest,
  IMerkleProof,
  IVerifiablePresentation,
} from "@cryptkeeperzk/types";

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
      // TODO: I still need to enhance the idea of `connected` vs `disconnected` and `login` vs `logout`
      // And also the relation of them with `identity_changed`
      // This refactor enhancement left for the next PR
      //
      // case setConnectedIdentity.type: {
      //   window.postMessage(
      //     {
      //       target: "injected-injectedscript",
      //       payload: [null, action.payload as ConnectedIdentityMetadata],
      //       nonce: EventName.IDENTITY_CHANGED,
      //     },
      //     "*",
      //   );
      //   return;
      // }
      // case setStatus.type: {
      //   window.postMessage(
      //     {
      //       target: "injected-injectedscript",
      //       payload: [null],
      //       nonce: !(action.payload as { isUnlocked: boolean }).isUnlocked ? EventName.LOGOUT : EventName.LOGIN,
      //     },
      //     "*",
      //   );
      //   return;
      // }
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
      case EventName.JOIN_GROUP: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, action.payload as { groupId: string }],
            nonce: EventName.JOIN_GROUP,
          },
          "*",
        );
        break;
      }
      case EventName.GROUP_MERKLE_PROOF: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, action.payload as { merkleProof: IMerkleProof }],
            nonce: EventName.GROUP_MERKLE_PROOF,
          },
          "*",
        );
        break;
      }
      case EventName.USER_REJECT: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, action.payload as IRejectedRequest],
            nonce: EventName.USER_REJECT,
          },
          "*",
        );
        break;
      }
      case EventName.GENERATE_VERIFIABLE_PRESENTATION: {
        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [
              null,
              (action.payload as { verifiablePresentation: IVerifiablePresentation }).verifiablePresentation,
            ],
            nonce: EventName.GENERATE_VERIFIABLE_PRESENTATION,
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
