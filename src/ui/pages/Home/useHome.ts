import BigNumber from "bignumber.js";
import { useEffect, useCallback } from "react";

import { Chain } from "@src/config/rpc";
import { IdentityData } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHistory, fetchIdentities, useIdentities } from "@src/ui/ducks/identities";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { useEthWallet } from "@src/ui/hooks/wallet";
import { getLastActiveTabUrl } from "@src/util/browser";

export interface IUseHomeData {
  identities: IdentityData[];
  address?: string;
  balance?: BigNumber;
  chain?: Chain;
  refreshConnectionStatus: () => Promise<boolean>;
}

export const useHome = (): IUseHomeData => {
  const dispatch = useAppDispatch();
  const identities = useIdentities();

  const { address, chain, balance } = useEthWallet();

  const refreshConnectionStatus = useCallback(async () => {
    const tabUrl = await getLastActiveTabUrl();

    if (!tabUrl) {
      return false;
    }

    return dispatch(checkHostApproval(tabUrl.origin));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchIdentities());
    dispatch(fetchHistory());
  }, [dispatch]);

  return {
    address,
    chain,
    balance,
    identities,
    refreshConnectionStatus,
  };
};
