import BigNumber from "bignumber.js";

export const checkBigNumber = (value?: string): boolean => (value ? !new BigNumber(value).isNaN() : false);

export const convertFromHexToDec = (value: string): string =>
  checkBigNumber(value) ? new BigNumber(value).toString(10) : value;
