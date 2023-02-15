import * as React from "react";
import ReactDOM from "react-dom/client";
import { browser } from "webextension-polyfill-ts";
import Popup from "@src/ui/pages/Popup";
import { Provider } from "react-redux";
import { store } from "@src/ui/store/configureAppStore";
import { HashRouter } from "react-router-dom";
import log from "loglevel";

log.setDefaultLevel(globalThis.CRYPTKEEPER_UI_DEBUG ? "debug" : "info");

browser.runtime.onMessage.addListener(action => {
  if (action?.type) {
    store.dispatch(action);
  }
});

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  browser.runtime.connect();

  const root = ReactDOM.createRoot(document.getElementById("popup") as HTMLElement);
  root.render(
    <Provider store={store}>
      <HashRouter>
        <Popup />
      </HashRouter>
    </Provider>,
  );
  log.debug("CryptKeeper UI initialization complete.");
});
