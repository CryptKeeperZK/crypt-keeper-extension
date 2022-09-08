export const ellipsify = (text: string, start = 6, end = 4) => `${text.slice(0, start)}...${text.slice(-end)}`;

export const sliceAddress = (address: string): string => {
  return address.slice(0, 6) + "..." + address.slice(address.length - 3, address.length);
};
