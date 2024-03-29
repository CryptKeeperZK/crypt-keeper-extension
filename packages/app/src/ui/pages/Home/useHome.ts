import { useEffect, useCallback } from "react";

import { fetchConnections, useConnectedOrigins } from "@src/ui/ducks/connections";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHistory, fetchIdentities, useIdentities } from "@src/ui/ducks/identities";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { useEthWallet } from "@src/ui/hooks/wallet";
import { getLastActiveTabUrl } from "@src/util/browser";

import type { IIdentityData } from "@cryptkeeperzk/types";

export interface IUseHomeData {
  identities: IIdentityData[];
  connectedOrigins: Record<string, string>;
  address?: string;
  refreshConnectionStatus: () => Promise<boolean>;
}

export const useHome = (): IUseHomeData => {
  const dispatch = useAppDispatch();
  const identities = useIdentities();
  const connectedOrigins = useConnectedOrigins();

  const { address } = useEthWallet();

  const refreshConnectionStatus = useCallback(async () => {
    const tabUrl = await getLastActiveTabUrl();

    if (!tabUrl) {
      return false;
    }

    return dispatch(checkHostApproval(tabUrl.origin));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchIdentities());
    dispatch(fetchConnections());
    dispatch(fetchHistory());
  }, [dispatch]);

  return {
    address,
    identities,
    connectedOrigins,
    refreshConnectionStatus,
  };
};
