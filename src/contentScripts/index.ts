import { browser } from "webextension-polyfill-ts";
import { IdentityActionType } from "@src/ui/ducks/identities";
import { AppActionType } from "@src/ui/ducks/app";
import log from "loglevel";

function intjectScirpt() {
  const url = browser.runtime.getURL("js/injected.js");
  const container = document.head || document.documentElement;
  const scriptTag = document.createElement("script");
  scriptTag.src = url;
  scriptTag.setAttribute("async", "false");
  container.insertBefore(scriptTag, container.children[0]);
  container.removeChild(scriptTag);
}

(async function () {
  try {
    intjectScirpt();

    const extensionPort = browser.runtime.connect(undefined, { name: "cryptkeeper-contentscript" });

    window.addEventListener("message", async (event) => {
      const { data } = event;
      if (data && data.target === "injected-contentscript") {
        extensionPort.postMessage(data.message);
        console.log("window.addEventListener");
        console.log(event);
      }
    });

    extensionPort.onMessage.addListener((action) => {
      console.log("extensionPort.onMessage");
      console.log(action);
      switch (action.type) {
        case IdentityActionType.SET_SELECTED:
          window.postMessage(
            {
              target: "injected-injectedscript",
              payload: [null, action.payload],
              nonce: "identityChanged",
            },
            "*",
          );
          return;
        case AppActionType.SET_STATUS:
          if (!action.payload.unlocked) {
            window.postMessage(
              {
                target: "injected-injectedscript",
                payload: [null],
                nonce: "logout",
              },
              "*",
            );
            return;
          } else {
            window.postMessage(
              {
                target: "injected-injectedscript",
                payload: [null, action.payload],
                nonce: "login",
              },
              "*",
            );
            return;
          }
        default:
          window.postMessage(
            {
              target: "injected-injectedscript",
              payload: [null, action.payload],
              nonce: "default",
            },
            "*",
          );
          return;
      }
    });
  } catch (e) {
    log.error("error occured", e);
  }
})();
