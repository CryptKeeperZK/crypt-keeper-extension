import { useEffect, useCallback } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  connectIdentity,
  fetchHistory,
  fetchIdentities,
  useIdentities,
  useConnectedIdentity,
} from "@src/ui/ducks/identities";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { useEthWallet } from "@src/ui/hooks/wallet";
import { getLastActiveTabUrl } from "@src/util/browser";

import type { IdentityData } from "@src/types";

export interface IUseHomeData {
  identities: IdentityData[];
  connectedIdentity?: IdentityData;
  address?: string;
  refreshConnectionStatus: () => Promise<boolean>;
  onSelectIdentity: (identityCommitment: string) => void;
}

export const useHome = (): IUseHomeData => {
  const dispatch = useAppDispatch();
  const identities = useIdentities();
  const connectedIdentity = useConnectedIdentity();

  const { address } = useEthWallet();

  const refreshConnectionStatus = useCallback(async () => {
    const tabUrl = await getLastActiveTabUrl();

    if (!tabUrl) {
      return false;
    }

    return dispatch(checkHostApproval(tabUrl.origin));
  }, [dispatch]);

  const onSelectIdentity = useCallback(
    (identityCommitment: string) => {
      const identity = identities.find(({ commitment }) => commitment === identityCommitment);

      dispatch(
        connectIdentity({
          identityCommitment,
          host: identity?.metadata.host as string,
        }),
      );
    },
    [identities, dispatch],
  );

  useEffect(() => {
    dispatch(fetchIdentities());
    dispatch(fetchHistory());
  }, [dispatch]);

  return {
    address,
    connectedIdentity,
    identities,
    refreshConnectionStatus,
    onSelectIdentity,
  };
};
