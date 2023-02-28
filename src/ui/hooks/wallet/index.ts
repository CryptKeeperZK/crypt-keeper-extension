import { useWeb3React, Web3ReactHooks } from "@web3-react/core";
import type { Connector } from "@web3-react/types";
import type { Web3Provider } from "@ethersproject/providers";
import BigNumber from "bignumber.js";
import { formatUnits } from "@ethersproject/units";
import { useEffect, useState } from "react";

import { ConnectorNames, metamaskHooks, getConnectorName } from "@src/connectors";
import { createMockConnectorHooks } from "@src/connectors/mock";
import { Chain, getChains } from "@src/config/rpc";
import { ZERO_ADDRESS } from "@src/config/const";

export interface IUseWalletData {
  isActive: boolean;
  isActivating: boolean;
  address?: string;
  balance?: BigNumber;
  chain?: Chain;
  connectorName?: ConnectorNames;
  connector?: Connector;
  provider?: Web3Provider;
}

const connectorHandlers: Record<string, Web3ReactHooks | undefined> = {
  [ConnectorNames.METAMASK.toLowerCase()]: metamaskHooks,
  [ConnectorNames.MOCK.toLowerCase()]: createMockConnectorHooks({
    chainId: 1,
    accounts: [ZERO_ADDRESS],
  }),
  [ConnectorNames.UNKNOWN.toLowerCase()]: undefined,
};

export const useWallet = (): IUseWalletData => {
  const [balance, setBalance] = useState<BigNumber>();
  const { connector, isActive, isActivating, provider } = useWeb3React();
  const connectorName = getConnectorName(connector);

  const handlers = connectorHandlers[connectorName.toLowerCase()];
  const chains = getChains();

  const chainId = handlers?.useChainId();
  const address = handlers?.useAccount();
  const chain = chainId ? chains[chainId] : undefined;
  const decimals = chain?.nativeCurrency.decimals;

  useEffect(() => {
    if (!address || !provider) {
      return undefined;
    }

    provider
      .getBalance(address)
      .then(wei => new BigNumber(formatUnits(wei, decimals)))
      .then(value => setBalance(value));
  }, [address, chainId, provider, decimals, setBalance]);

  return {
    isActive,
    isActivating,
    address,
    balance,
    chain,
    connectorName,
    connector,
    provider,
  };
};
