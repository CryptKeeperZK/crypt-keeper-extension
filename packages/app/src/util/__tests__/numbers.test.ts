import { checkBigNumber, convertFromHexToDec } from "../numbers";

describe("util/numbers", () => {
  test("should check big numbers properly", () => {
    expect(checkBigNumber("1")).toBe(true);
    expect(checkBigNumber("12345678901234567890123456789012345678901234567890")).toBe(true);
    expect(checkBigNumber("-")).toBe(false);
    expect(checkBigNumber("0x")).toBe(false);
    expect(checkBigNumber()).toBe(false);
  });

  test("should convert from hex or return original value", () => {
    expect(convertFromHexToDec("1")).toBe("1");
    expect(convertFromHexToDec("0xDEADBEAF")).toBe("3735928495");
    expect(convertFromHexToDec("0x")).toBe("0x");
  });
});
