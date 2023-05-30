import { useWeb3React } from "@web3-react/core";
import { useCallback } from "react";

import { cryptKeeperHooks, cryptKeeper } from "@src/connectors";
import { ConnectorNames, IUseWalletData } from "@src/types";
import { lock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export const useCryptKeeperWallet = (): IUseWalletData => {
  const { isActive, isActivating } = useWeb3React();
  const dispatch = useAppDispatch();

  const address = cryptKeeperHooks?.useAccount();

  const onConnect = useCallback(async () => {
    await cryptKeeper.activate();
  }, [cryptKeeper]);

  const onConnectEagerly = useCallback(async () => {
    await cryptKeeper.connectEagerly?.();
  }, [cryptKeeper]);

  const onDisconnect = useCallback(async () => {
    await cryptKeeper.deactivate?.();
    await cryptKeeper.resetState();
  }, [cryptKeeper]);

  const onLock = useCallback(() => {
    dispatch(lock());
  }, [dispatch]);

  return {
    isActive,
    isActivating,
    isInjectedWallet: Boolean(window.cryptkeeper),
    address,
    connectorName: ConnectorNames.CRYPT_KEEPER,
    connector: cryptKeeper,
    balance: undefined,
    chain: undefined,
    provider: undefined,
    onConnect,
    onConnectEagerly,
    onDisconnect,
    onLock,
  };
};
