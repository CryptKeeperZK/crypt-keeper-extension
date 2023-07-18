/**
 * @jest-environment jsdom
 */

import { mockJsonFile } from "@src/config/mock/file";

import { readFile } from "../file";

describe("util/file", () => {
  test("should read file properly", async () => {
    const result = await readFile(mockJsonFile);

    expect(result.target?.result).toBe(JSON.stringify({ ping: true }));
  });

  test("should return empty string is there is no read result", async () => {
    const result = await readFile(new File([], "name"));

    expect(result.target?.result).toBe("");
  });
});
