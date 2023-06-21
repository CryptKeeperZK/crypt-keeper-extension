import "../initGlobals";

describe("background/shared/initGlobals", () => {
  test("should set window to globalThis object", () => {
    expect(globalThis.window).toStrictEqual(globalThis);
  });

  test("should set XMLHttpRequest to undefined", () => {
    expect(globalThis.XMLHttpRequest).toBeUndefined();
  });
});
