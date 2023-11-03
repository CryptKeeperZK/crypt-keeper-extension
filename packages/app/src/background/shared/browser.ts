import has from "lodash/has";
import browser, { type Runtime } from "webextension-polyfill";

const ACTION_TYPE = "CRYPTKEEPER_READY";

export async function sendReadyMessageToTabs(): Promise<void> {
  const tabs = await browser.tabs
    .query({ url: "<all_urls>", windowType: "normal" })
    .then((tab) => {
      checkForLastErrorAndLog();
      return tab;
    })
    .catch(() => {
      checkForLastErrorAndLog();
    });

  tabs?.forEach((tab) => {
    if (tab.id === undefined) {
      return;
    }

    browser.tabs
      .sendMessage(tab.id, { type: ACTION_TYPE })
      .then(checkForLastErrorAndLog)
      .catch(checkForLastErrorAndLog);
  });
}

export function checkForLastErrorAndLog(): Runtime.PropertyLastErrorType | Error | undefined {
  const error = checkForLastError();

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return error;
}

export function checkForLastError(): Runtime.PropertyLastErrorType | Error | undefined {
  const { lastError } = browser.runtime;

  if (!lastError) {
    return undefined;
  }

  if (has(lastError, "stack") && lastError.message) {
    return lastError;
  }

  return new Error(lastError.message);
}
