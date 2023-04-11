import BigNumber from "bignumber.js";
import { useEffect, useCallback } from "react";

import { Chain } from "@src/config/rpc";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, useIdentities, IdentityData } from "@src/ui/ducks/identities";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { useWallet } from "@src/ui/hooks/wallet";
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

  const { address, chain, balance } = useWallet();

  const refreshConnectionStatus = useCallback(async () => {
    const tabUrl = await getLastActiveTabUrl();

    if (!tabUrl) {
      return false;
    }

    return dispatch(checkHostApproval(tabUrl.origin));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchIdentities());
  }, [dispatch]);

  return {
    address,
    chain,
    balance,
    identities,
    refreshConnectionStatus,
  };
};
