import log from "loglevel";

import { isDebugMode } from "@src/config/env";
import { initializeInjectedProvider } from "@src/providers";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

try {
  initializeInjectedProvider();
} catch (error) {
  log.error(`Error in injecting CryptKeeper Injected Provider`);
}
