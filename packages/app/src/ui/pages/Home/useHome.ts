import { useEffect, useCallback } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHistory, fetchIdentities, useIdentities, useConnectedIdentity } from "@src/ui/ducks/identities";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { fetchVerifiableCredentials, useVerifiableCredentials } from "@src/ui/ducks/verifiableCredentials";
import { useEthWallet } from "@src/ui/hooks/wallet";
import { getLastActiveTabUrl } from "@src/util/browser";

import type { IdentityData } from "@src/types";

export interface IUseHomeData {
  identities: IdentityData[];
  connectedIdentity?: IdentityData;
  address?: string;
  serializedVerifiableCredentials: string[];
  refreshConnectionStatus: () => Promise<boolean>;
}

export const useHome = (): IUseHomeData => {
  const dispatch = useAppDispatch();
  const identities = useIdentities();
  const connectedIdentity = useConnectedIdentity();
  const serializedVerifiableCredentials = useVerifiableCredentials();

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
    dispatch(fetchHistory());
    dispatch(fetchVerifiableCredentials());
  }, [dispatch]);

  return {
    address,
    connectedIdentity,
    identities,
    serializedVerifiableCredentials,
    refreshConnectionStatus,
  };
};
