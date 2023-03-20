// Source: https://github.com/MetaMask/metamask-extension/blob/develop/app/scripts/app-init.js
// This file is used only for manifest version 3

// Represents if importAllScripts has been run
let scriptsLoadInitiated = false;

export function importAllScripts(): boolean {
  // Bail if we've already imported scripts
  if (scriptsLoadInitiated) {
    return false;
  }

  scriptsLoadInitiated = true;

  return true;
}

export function isScriptsLoadInitiated(): boolean {
  return scriptsLoadInitiated;
}
