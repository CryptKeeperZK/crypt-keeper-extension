import { getUrlOrigin } from "@src/util/browser";

import Handler from "../handler";

jest.mock("@src/util/browser", (): unknown => ({
  ...jest.requireActual("@src/util/browser"),
  getUrlOrigin: jest.fn(),
  getExtensionUrl: jest.fn(),
}));

describe("background/controllers/handler", () => {
  const defaultSender = { url: "http://localhost:3000" };
  const defaultOptions = { sender: defaultSender };

  beforeEach(() => {
    (getUrlOrigin as jest.Mock).mockReturnValue(defaultOptions.sender.url);
  });

  afterEach(() => {
    (getUrlOrigin as jest.Mock).mockClear();
  });

  test("should add handler method properly and process it", async () => {
    const handler = new Handler();

    handler.add(
      "counter",
      (count: number) => count + 1,
      (count: number) => count + 2,
      (count: number) => count + 3,
      (count: number) => count + 4,
    );

    const result = await handler.handle({ method: "counter", payload: 0 }, defaultOptions);

    expect(result).toBe(10);
  });

  test("should throw error for unauthorized call", async () => {
    (getUrlOrigin as jest.Mock).mockReturnValueOnce(defaultOptions.sender.url).mockReturnValue("extension-url");

    const handler = new Handler();

    handler.add("counter", (count: number) => count + 1);

    await expect(handler.handle({ method: "counter", payload: 0 }, defaultOptions)).rejects.toThrow(
      "Method counter is not allowed to be called outside",
    );
  });

  test("should bypass url check properly", async () => {
    (getUrlOrigin as jest.Mock).mockReturnValueOnce(defaultOptions.sender.url).mockReturnValue("extension-url");

    const handler = new Handler();

    handler.add("counter", (count: number) => count + 1);

    const result = await handler.handle({ method: "counter", payload: 0 }, { ...defaultOptions, bypass: true });

    expect(result).toBe(1);
  });

  test("should throw error if there is no registered method", () => {
    const handler = new Handler();

    expect(handler.handle({ method: "unknown" }, defaultOptions)).rejects.toThrowError(
      "method: unknown is not detected",
    );
  });
});
