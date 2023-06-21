import { generateMnemonic, validateMnemonic, mnemonicToSeed } from "..";

describe("background/services/mnemonic", () => {
  test("should generate valid mnemonic", () => {
    const mnemonic = generateMnemonic();

    const isValid = validateMnemonic(mnemonic);

    expect(isValid).toBe(true);
  });

  test("should generate seed from mnemonic", async () => {
    const mnemonic = generateMnemonic();

    const seed = await mnemonicToSeed(mnemonic);

    expect(seed).toBeDefined();
  });
});
