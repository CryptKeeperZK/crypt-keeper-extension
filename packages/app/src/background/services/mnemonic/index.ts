import * as bip39 from "bip39";

export const generateMnemonic = (): string => bip39.generateMnemonic();

export const validateMnemonic = (mnemonic: string): boolean => bip39.validateMnemonic(mnemonic);

export const mnemonicToSeed = (mnemonic: string): Promise<string> =>
  bip39.mnemonicToSeed(mnemonic).then((bytes) => bytes.toString("hex"));
