import { library } from "@fortawesome/fontawesome-svg-core";
import { faTwitter, faGithub, faReddit } from "@fortawesome/free-brands-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { ThemeProvider } from "@mui/material/styles";
import { AnyAction } from "@reduxjs/toolkit";
import { Web3ReactProvider } from "@web3-react/core";
import log from "loglevel";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { browser } from "webextension-polyfill-ts";

import { isDebugMode } from "@src/config/env";
import { connectors } from "@src/connectors";
import Popup from "@src/ui/pages/Popup";
import { store } from "@src/ui/store/configureAppStore";

import { createMetamaskProvider } from "./services/provider";
import { theme } from "./theme";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

const provider = createMetamaskProvider(process.env.METAMASK_EXTENSION_ID);
window.ethereum = provider;

provider.on("error", (error: unknown) => {
  if ((error as string).includes(`Lost connection`)) {
    window.ethereum = undefined;
  }
});

browser.runtime.onMessage.addListener((action?: AnyAction) => {
  if (action?.type) {
    store.dispatch(action);
  }
});

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  browser.runtime.connect();

  const root = ReactDOM.createRoot(document.getElementById("popup") as HTMLElement);

  library.add(faTwitter, faGithub, faReddit, faLink);

  root.render(
    <Provider store={store}>
      <HashRouter>
        <Web3ReactProvider connectors={connectors}>
          <Suspense>
            <ThemeProvider theme={theme}>
              <Popup />
            </ThemeProvider>
          </Suspense>
        </Web3ReactProvider>
      </HashRouter>
    </Provider>,
  );
  log.debug("CryptKeeper UI initialization complete.");
});
