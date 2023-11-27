/**
 * @jest-environment jsdom
 */

jest.retryTimes(1, { logErrorsBeforeRetry: true });

window.postMessage = jest.fn();
window.dispatchEvent = jest.fn();
window.addEventListener = jest.fn();
window.isCryptkeeperInjected = true;
