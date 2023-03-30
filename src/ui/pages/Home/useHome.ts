import BigNumber from "bignumber.js";
import { useRef, useState, useEffect, useCallback, RefObject } from "react";
import { browser } from "webextension-polyfill-ts";

import { Chain } from "@src/config/rpc";
import { RPCAction } from "@src/constants";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, deleteAllIdentities, useIdentities, IdentityData } from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";
import postMessage from "@src/util/postMessage";

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
    const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });

    if (!tab?.url) {
      return false;
    }

    return postMessage<boolean>({
      method: RPCAction.IS_HOST_APPROVED,
      payload: new URL(tab.url).origin,
    });
  }, []);

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
