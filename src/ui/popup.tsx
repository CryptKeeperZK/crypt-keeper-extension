import { library } from "@fortawesome/fontawesome-svg-core";
import { faTwitter, faGithub, faReddit } from "@fortawesome/free-brands-svg-icons";
import { Web3ReactProvider } from "@web3-react/core";
import log from "loglevel";
import createMetaMaskProvider from "metamask-extension-provider";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { AnyAction } from "redux";
import { browser } from "webextension-polyfill-ts";

import { isDebugMode } from "@src/config/env";
import { connectors } from "@src/connectors";
import { Popup } from "@src/ui/pages/Popup";
import { store } from "@src/ui/store/configureAppStore";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

window.ethereum = createMetaMaskProvider();

browser.runtime.onMessage.addListener((action?: AnyAction) => {
  if (action?.type) {
    store.dispatch(action);
  }
});

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  browser.runtime.connect();

  const root = ReactDOM.createRoot(document.getElementById("popup") as HTMLElement);

  library.add(faTwitter, faGithub, faReddit);

  root.render(
    <Provider store={store}>
      <HashRouter>
        <Web3ReactProvider connectors={connectors}>
          <Popup />
        </Web3ReactProvider>
      </HashRouter>
    </Provider>,
  );
  log.debug("CryptKeeper UI initialization complete.");
});
