import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

// Source: https://github.com/MetaMask/metamask-extension/blob/develop/app/scripts/app-init.js
// This file is used only for manifest version 3

// Represents if importAllScripts has been run
// eslint-disable-next-line
let scriptsLoadInitiated = false;

const loadTimeLogs = [];

function tryImport(fileNames) {
  try {
    const startTime = new Date().getTime();
    // eslint-disable-next-line
    try {
      importScripts(...fileNames);
    } catch (e) {
      log.error("Error in executing importScripts()", e);
    }

    const endTime = new Date().getTime();
    fileNames.forEach(fileName => {
      loadTimeLogs.push({
        name: fileName,
        value: endTime - startTime,
        children: [],
        startTime,
        endTime,
      });
    });

    return true;
  } catch (e) {
    log.error(e);
  }

  return false;
}

export default function importAllScripts() {
  // Bail if we've already imported scripts
  if (scriptsLoadInitiated) {
    return;
  }
  scriptsLoadInitiated = true;

  const startImportScriptsTime = Date.now();

  // Import all required resources
  // tryImport([browser.runtime.getURL("js/init-globals.js")]);

  // for performance metrics/reference
  log.debug(`SCRIPTS IMPORT COMPLETE in Seconds: ${(Date.now() - startImportScriptsTime) / 1000}`);
}
