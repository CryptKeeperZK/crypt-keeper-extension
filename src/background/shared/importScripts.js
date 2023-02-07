import "./init-globals";
import log from 'loglevel';

// Source: https://github.com/MetaMask/metamask-extension/blob/develop/app/scripts/app-init.js
/* global chrome */
// This file is used only for manifest version 3

// Represents if importAllScripts has been run
// eslint-disable-next-line
let scriptsLoadInitiated = false;

const testMode = false;

const loadTimeLogs = [];

// eslint-disable-next-line import/unambiguous
function tryImport(fileNames) {
  try {
    const startTime = new Date().getTime();
    // eslint-disable-next-line
    try {
      importScripts(fileNames);
    } catch (e) {
      log.error("Error in executing importScripts()", e);
    }

    const endTime = new Date().getTime();
    loadTimeLogs.push({
      name: fileNames[0],
      value: endTime - startTime,
      children: [],
      startTime,
      endTime,
    });

    return true;
  } catch (e) {
    console.error(e);
  }

  return false;
}

export default function importAllScripts() {
  // Bail if we've already imported scripts
  if (scriptsLoadInitiated) {
    return;
  }
  scriptsLoadInitiated = true;
  const files = [];

  // In testMode individual files are imported, this is to help capture load time stats
  const loadFile = (fileName) => {
    if (testMode) {
      tryImport(fileName);
    } 
  };

  const startImportScriptsTime = Date.now();

  loadFile('./globalThis.js');
  loadFile('./init-globals.js');

  // Import all required resources
  //tryImport(...files);

  const endImportScriptsTime = Date.now();

  // for performance metrics/reference
  log.debug(
    `SCRIPTS IMPORT COMPLETE in Seconds: ${
      (Date.now() - startImportScriptsTime) / 1000
    }`,
  );

  // In testMode load time logs are output to console
  if (testMode) {
    log.debug(
      `Time for each import: ${JSON.stringify(
        {
          name: 'Total',
          children: loadTimeLogs,
          startTime: startImportScriptsTime,
          endTime: endImportScriptsTime,
          value: endImportScriptsTime - startImportScriptsTime,
          version: 1,
        },
        undefined,
        '    ',
      )}`,
    );
  }
}