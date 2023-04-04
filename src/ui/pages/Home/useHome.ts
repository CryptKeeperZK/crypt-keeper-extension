import BigNumber from "bignumber.js";
import { useRef, useState, useEffect, useCallback, RefObject } from "react";

import { Chain } from "@src/config/rpc";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, deleteAllIdentities, useIdentities, IdentityData } from "@src/ui/ducks/identities";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { useWallet } from "@src/ui/hooks/wallet";
import { getLastActiveTabUrl } from "@src/util/browser";

export interface IUseHomeData {
  isFixedTabsMode: boolean;
  identities: IdentityData[];
  scrollRef: RefObject<HTMLDivElement>;
  address?: string;
  balance?: BigNumber;
  chain?: Chain;
  refreshConnectionStatus: () => Promise<boolean>;
  onDeleteAllIdentities: () => void;
  onScroll: () => void;
}

const SCROLL_THRESHOLD = 92;

export const useHome = (): IUseHomeData => {
  const dispatch = useAppDispatch();
  const identities = useIdentities();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFixedTabsMode, setFixTabsMode] = useState(false);

  const { address, chain, balance } = useWallet();

  const onScroll = useCallback(() => {
    if (!scrollRef.current) {
      return;
    }

    setFixTabsMode(scrollRef.current.scrollTop > SCROLL_THRESHOLD);
  }, [scrollRef, setFixTabsMode]);

  const onDeleteAllIdentities = useCallback(() => {
    dispatch(deleteAllIdentities());
  }, [dispatch]);

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
    scrollRef,
    isFixedTabsMode,
    address,
    chain,
    balance,
    identities,
    refreshConnectionStatus,
    onDeleteAllIdentities,
    onScroll,
  };
};
