import { browser } from "webextension-polyfill-ts";

import { getLastActiveTabUrl } from "../browser";

describe("util/browser", () => {
  const defaultTabs = [{ url: "http://localhost:3000" }];

  beforeEach(() => {
    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should get last active tab url properly", async () => {
    const url = await getLastActiveTabUrl();

    expect(url?.origin).toBe(defaultTabs[0].url);
  });

  test("should return undefined if there is no tab url", async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValue([]);

    const url = await getLastActiveTabUrl();

    expect(url).toBeUndefined();
  });
});
