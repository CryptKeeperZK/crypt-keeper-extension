import { initializeInjectedProvider } from "@cryptkeeper/providers";
import log from "loglevel";

import { isDebugMode } from "@src/config/env";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

try {
  initializeInjectedProvider();
} catch (error) {
  log.error(`Error in injecting CryptKeeper Injected Provider`);
}
