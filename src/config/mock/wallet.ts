import BigNumber from "bignumber.js";
import type { Web3Provider } from "@ethersproject/providers";

import type { IUseWalletData } from "@src/ui/hooks/wallet";

import { ConnectorNames } from "@src/connectors";
import { mockConnector } from "@src/connectors/mock";
import { ZERO_ADDRESS } from "../const";
import { getChains } from "../rpc";

export const defaultWalletHookData: IUseWalletData = {
  isActive: false,
  isActivating: false,
  address: ZERO_ADDRESS,
  balance: new BigNumber(1000),
  chain: getChains()[1],
  connectorName: ConnectorNames.MOCK,
  connector: mockConnector,
  provider: {
    getSigner: jest.fn(),
    getBalance: jest.fn(),
  } as unknown as Web3Provider,
  onConnect: jest.fn(),
  onConnectEagerly: jest.fn(),
  onDisconnect: jest.fn(),
};
