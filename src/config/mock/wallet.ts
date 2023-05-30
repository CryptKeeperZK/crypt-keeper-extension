import BigNumber from "bignumber.js";

import { mockConnector } from "@src/connectors/mock";
import { ConnectorNames, IUseWalletData } from "@src/types";

import type { BrowserProvider } from "ethers";

import { ZERO_ADDRESS } from "../const";
import { getChains } from "../rpc";

export const defaultWalletHookData: IUseWalletData = {
  isActive: false,
  isActivating: false,
  isInjectedWallet: true,
  address: ZERO_ADDRESS,
  balance: new BigNumber(1000),
  chain: getChains()[1],
  connectorName: ConnectorNames.MOCK,
  connector: mockConnector,
  provider: {
    getSigner: jest.fn(),
    getBalance: jest.fn(),
  } as unknown as BrowserProvider,
  onConnect: jest.fn(() => Promise.resolve()),
  onConnectEagerly: jest.fn(() => Promise.resolve()),
  onDisconnect: jest.fn(),
  onLock: jest.fn(),
};
