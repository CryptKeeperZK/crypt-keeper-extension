import BigNumber from "bignumber.js";

import { ConnectorNames } from "@src/connectors";
import { mockConnector } from "@src/connectors/mock";

import type { IUseEthWalletData } from "@src/ui/hooks/wallet";
import type { BrowserProvider } from "ethers";

import { ZERO_ADDRESS } from "../const";
import { getChains } from "../rpc";

export const defaultWalletHookData: IUseEthWalletData = {
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
