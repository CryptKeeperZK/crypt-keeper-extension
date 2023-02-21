import log from "loglevel";

// Source: https://github.com/MetaMask/metamask-extension/blob/develop/app/scripts/app-init.js
// This file is used only for manifest version 3

// Represents if importAllScripts has been run
let scriptsLoadInitiated = false;

export default function importAllScripts() {
  // Bail if we've already imported scripts
  if (scriptsLoadInitiated) {
    return;
  }
  scriptsLoadInitiated = true;

  const startImportScriptsTime = Date.now();

  // for performance metrics/reference
  log.debug(`SCRIPTS IMPORT COMPLETE in Seconds: ${(Date.now() - startImportScriptsTime) / 1000}`);
}
