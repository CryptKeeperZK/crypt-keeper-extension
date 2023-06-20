import type { Chain } from "../config";
import type { Connector } from "@web3-react/types";
import type BigNumber from "bignumber.js";
import type { BrowserProvider } from "ethers";

export enum ConnectorNames {
  METAMASK = "MetaMask",
  CRYPTKEEPER = "CryptKeeper",
  MOCK = "Mock",
  UNKNOWN = "Unknown",
}

export interface IUseWalletData {
  isActive: boolean;
  isActivating: boolean;
  isInjectedWallet: boolean;
  addresses?: string[];
  address?: string;
  balance?: BigNumber;
  chain?: Chain;
  connectorName?: ConnectorNames;
  connector?: Connector;
  provider?: BrowserProvider;
  onConnect: () => Promise<void>;
  onConnectEagerly: () => Promise<void>;
  onLock: () => void;
  onDisconnect: () => Promise<void>;
}
