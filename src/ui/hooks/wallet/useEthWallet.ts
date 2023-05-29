import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { formatUnits } from "ethers";
import { useCallback, useEffect, useState } from "react";

import { getChains } from "@src/config/rpc";
import { metamask, metamaskHooks } from "@src/connectors";
import { ConnectorNames, IUseWalletData } from "@src/types";
import { useAppStatus, getWalletConnection, setWalletConnection, lock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import type { BrowserProvider } from "ethers";

const hooksByConnectorName = {
  [ConnectorNames.METAMASK]: { connector: metamask, hooks: metamaskHooks },
  [ConnectorNames.MOCK]: undefined,
  [ConnectorNames.CRYPT_KEEPER]: undefined,
  [ConnectorNames.UNKNOWN]: undefined,
};

export const useEthWallet = (connectorName = ConnectorNames.METAMASK): IUseWalletData => {
  const [balance, setBalance] = useState<BigNumber>();
  const { isActive, isActivating, provider } = useWeb3React();
  const { isDisconnectedPermanently } = useAppStatus();
  const dispatch = useAppDispatch();
  const connection = hooksByConnectorName[connectorName];
  const connector = connection?.connector;

  const chains = getChains();

  const chainId = connection?.hooks.useChainId();
  const address = connection?.hooks.useAccount();
  const addresses = connection?.hooks.useAccounts();
  const chain = chainId ? chains[chainId] : undefined;
  const decimals = chain?.nativeCurrency.decimals;

  useEffect(() => {
    dispatch(getWalletConnection());
  }, [dispatch]);

  useEffect(() => {
    if (!address || !provider) {
      return;
    }

    provider
      .getBalance(address)
      .then((wei) => new BigNumber(formatUnits(wei.toString(), decimals)))
      .then((value) => setBalance(value));
  }, [address, chainId, provider, decimals, setBalance]);

  const onConnect = useCallback(async () => {
    dispatch(setWalletConnection(false));
    await connector?.activate();
  }, [connector, dispatch]);

  const onConnectEagerly = useCallback(async () => {
    if (isDisconnectedPermanently === false) {
      await connector?.connectEagerly?.();
    }
  }, [connector, isDisconnectedPermanently]);

  const onDisconnect = useCallback(async () => {
    dispatch(setWalletConnection(true));
    await connector?.deactivate?.();
    await connector?.resetState();
  }, [connector, dispatch]);

  const onLock = useCallback(() => {
    dispatch(lock());
  }, [dispatch]);

  return {
    isActive,
    isActivating,
    isInjectedWallet: Boolean(window.ethereum),
    address,
    addresses,
    balance,
    chain,
    connectorName,
    connector,
    provider: connector ? (provider as unknown as BrowserProvider) : undefined,
    onConnect,
    onConnectEagerly,
    onDisconnect,
    onLock,
  };
};
