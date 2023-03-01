import { ZERO_ADDRESS } from "@src/config/const";
import { sliceAddress, ellipsify } from "../account";

describe("util/account", () => {
  test("should slice address and return short representation", () => {
    const result = sliceAddress(ZERO_ADDRESS);

    expect(result).toBe("0x0000...0000");
  });

  test("should return the same string if it's not an address", () => {
    const result = sliceAddress("0x000000");

    expect(result).toBe("0x000000");
  });

  test("should ellipsify properly with default params", () => {
    const result = ellipsify(ZERO_ADDRESS);

    expect(result).toBe("0x0000...0000");
  });

  test("should return text from ellipsify if there is a cycle in slicing", () => {
    const result = ellipsify("12345678", 6, 12);

    expect(result).toBe("12345678");
  });
});
