import BigNumber from "bignumber.js";
import { useRef, useState, useEffect, useCallback, RefObject } from "react";
import { browser } from "webextension-polyfill-ts";

import { Chain } from "@src/config/rpc";
import { RPCAction } from "@src/constants";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, deleteAllIdentities, useIdentities, IdentityData } from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";
import postMessage from "@src/util/postMessage";

export interface IuseHomeData {
  scrollRef: RefObject<HTMLDivElement>;
  fixedTabs: boolean;
  address?: string;
  balance?: BigNumber;
  chain?: Chain;
  identities: IdentityData[];
  refreshConnectionStatus: () => Promise<boolean>;
  onDeleteAllIdentities: () => void;
  onScroll: () => void;
}

export const useHome = (): IuseHomeData => {
  const dispatch = useAppDispatch();
  const identities = useIdentities();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [fixedTabs, fixTabs] = useState(false);

  const { address, chain, balance } = useWallet();

  useEffect(() => {
    dispatch(fetchIdentities());
  }, [dispatch]);

  const onScroll = useCallback(() => {
    if (!scrollRef.current) {
      return;
    }

    fixTabs(scrollRef.current.scrollTop > 92);
  }, [scrollRef, fixTabs]);

  const onDeleteAllIdentities = useCallback(() => {
    dispatch(deleteAllIdentities());
  }, [dispatch]);

  const refreshConnectionStatus = useCallback(async () => {
    const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    const [tab] = tabs || [];

    if (!tab.url) {
      return false;
    }

    return postMessage<boolean>({
      method: RPCAction.IS_HOST_APPROVED,
      payload: new URL(tab.url).origin,
    });
  }, []);

  return {
    scrollRef,
    fixedTabs,
    address,
    chain,
    balance,
    identities,
    refreshConnectionStatus,
    onDeleteAllIdentities,
    onScroll,
  };
};
