import { browser } from "webextension-polyfill-ts";

export const isManifestV3 = chrome.runtime.getManifest().manifest_version === 3;
