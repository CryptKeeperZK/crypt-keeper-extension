import createMetaMaskProvider from "metamask-extension-provider";
import ReactDOM from "react-dom/client";
import { browser } from "webextension-polyfill-ts";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import log from "loglevel";

import Popup from "@src/ui/pages/Popup";
import { store } from "@src/ui/store/configureAppStore";
import { isDebugMode } from "@src/config/env";
import { Web3ReactProvider } from "@web3-react/core";
import { connectors } from "@src/connectors";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTwitter, faGithub, faReddit } from "@fortawesome/free-brands-svg-icons";
import { messageSenderFactory } from "@src/util/postMessage";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

window.ethereum = createMetaMaskProvider();

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  const extensionPort = browser.runtime.connect(undefined, { name: "cryptkeeper-popup" });

  extensionPort.onMessage.addListener((action) => {
    log.debug("Extension response");
    log.debug(action);
    if (action?.type) {
      store.dispatch(action);
    }
  });

  messageSenderFactory(extensionPort);

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
