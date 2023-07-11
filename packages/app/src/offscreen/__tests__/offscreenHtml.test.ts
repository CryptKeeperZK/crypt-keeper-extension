/**
 * @jest-environment jsdom
 */

import fs from "fs";
import path from "path";

const offscreenHtml = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf-8");

describe("Offscreen Html", () => {
  beforeEach(() => {
    document.documentElement.innerHTML = offscreenHtml.toString();
  });

  test("should be able to load offscreen html page probably", () => {
    expect(document.title).toBe("CryptKeeper Offscreen");
    expect(document.querySelector("main")).toBeDefined();
    expect(document.querySelector('script[src="js/offscreen.js"]')).toBeDefined();
  });
});
