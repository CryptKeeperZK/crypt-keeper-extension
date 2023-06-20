import { importAllScripts, isScriptsLoadInitiated } from "../importScripts";

describe("background/shared/importScripts", () => {
  test("should set scripts initialized flag properly", () => {
    expect(isScriptsLoadInitiated()).toBe(false);
    expect(importAllScripts()).toBe(true);

    expect(importAllScripts()).toBe(false);
    expect(isScriptsLoadInitiated()).toBe(true);
  });
});
