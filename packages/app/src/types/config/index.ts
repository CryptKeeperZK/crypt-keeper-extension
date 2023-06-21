export interface Chain {
  name: string;
  shortName: string;
  chainId: number;
  networkId: number;
  infoURL: string;
  rpc: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
