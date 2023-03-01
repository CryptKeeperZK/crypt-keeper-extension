import { isAddress } from "@ethersproject/address";

export const ellipsify = (text: string, start = 6, end = 4) => {
  if (text.length - end <= start) {
    return text;
  }

  return `${text.slice(0, start)}...${text.slice(text.length - end, text.length)}`;
};

export const sliceAddress = (address: string): string => {
  if (!isAddress(address)) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(address.length - 4, address.length)}`;
};
