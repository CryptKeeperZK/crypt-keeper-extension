import { detect } from "detect-browser";

import { createMetamaskProvider } from "..";

jest.mock("@metamask/providers");

jest.mock("detect-browser");

jest.mock("extension-port-stream");

describe("ui/services/provider", () => {
  test("should create provider properly", () => {
    const provider = createMetamaskProvider();

    expect(provider).toBeDefined();
  });

  test("should create provider properly with extension id", () => {
    const provider = createMetamaskProvider("extension id");

    expect(provider).toBeDefined();
  });

  test("should create provider properly for chrome browser", () => {
    (detect as jest.Mock).mockReturnValue({ name: "chrome" });

    const provider = createMetamaskProvider();

    expect(provider).toBeDefined();
  });

  test("should create provider properly for firefox browser", () => {
    (detect as jest.Mock).mockReturnValue({ name: "firefox" });

    const provider = createMetamaskProvider();

    expect(provider).toBeDefined();
  });
});
