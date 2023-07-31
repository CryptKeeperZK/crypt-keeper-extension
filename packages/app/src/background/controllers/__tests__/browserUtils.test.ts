import browser from "webextension-polyfill";

import BrowserUtils from "../browserUtils";

describe("background/controllers/browserUtils", () => {
  const defaultTabs = [
    { id: 1, active: true, highlighted: true },
    { id: 2, active: true, highlighted: false },
  ];

  const defaultPopupTab = { id: 3, active: true, highlighted: true };

  const defaultWindow = { id: 1 };

  beforeEach(() => {
    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (browser.tabs.create as jest.Mock).mockResolvedValue(defaultPopupTab);

    (browser.windows.create as jest.Mock).mockResolvedValue(defaultWindow);
  });

  test("should open and close popup properly", async () => {
    const browserUtils = BrowserUtils.getInstance();

    const popup = await browserUtils.openPopup({ params: { redirect: "/" } });

    expect(popup.id).toBe(defaultWindow.id);

    const result = await browserUtils.closePopup();

    expect(result).toBe(true);
  });

  test("should not open the same popup twice", async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValue([]);
    const browserUtils = BrowserUtils.getInstance();

    const popup = await browserUtils.openPopup();
    expect(popup.id).toBe(defaultWindow.id);

    const cachedPopup = await browserUtils.openPopup();
    expect(cachedPopup.id).toBe(popup.id);
  });

  test("should add and remove listeners properly", () => {
    const browserUtils = BrowserUtils.getInstance();
    const callback = () => null;

    browserUtils.addRemoveWindowListener(callback);
    browserUtils.removeRemoveWindowListener(callback);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(browser.windows.onRemoved.addListener).toBeCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(browser.windows.onRemoved.removeListener).toBeCalledTimes(1);
  });

  test("should clear storage properly", async () => {
    const browserUtils = BrowserUtils.getInstance();

    await browserUtils.clearStorage();

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(browser.storage.sync.clear).toBeCalledTimes(1);
  });
});
