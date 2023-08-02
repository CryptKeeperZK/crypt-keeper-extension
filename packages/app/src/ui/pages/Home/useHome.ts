import { useEffect, useCallback } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHistory, fetchIdentities, useIdentities, useConnectedIdentity } from "@src/ui/ducks/identities";
import { fetchVerifiableCredentials, useVerifiableCredentials } from "@src/ui/ducks/verifiableCredentials";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { useEthWallet } from "@src/ui/hooks/wallet";
import { getLastActiveTabUrl } from "@src/util/browser";

import type { FlattenedCryptkeeperVerifiableCredential, IdentityData, VerifiableCredential } from "@src/types";

export interface IUseHomeData {
  identities: IdentityData[];
  connectedIdentity?: IdentityData;
  address?: string;
  verifiableCredentials: FlattenedCryptkeeperVerifiableCredential[];
  refreshConnectionStatus: () => Promise<boolean>;
}

export const useHome = (): IUseHomeData => {
  const dispatch = useAppDispatch();
  const identities = useIdentities();
  const connectedIdentity = useConnectedIdentity();
  const verifiableCredentials = useVerifiableCredentials();

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
    verifiableCredentials,
    refreshConnectionStatus,
  };
};
