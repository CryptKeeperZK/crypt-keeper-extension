import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { browser } from "webextension-polyfill-ts";

import { RPCAction } from "@src/constants";
import { Header } from "@src/ui/components/Header";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { deleteAllIdentities, fetchIdentities } from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";
import postMessage from "@src/util/postMessage";

import { IdentityList, TabList, Info } from "./components";
import "./home.scss";

export const Home = (): JSX.Element => {
  const dispatch = useAppDispatch();

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

  return (
    <div className="w-full h-full flex flex-col home">
      <Header />

      <div
        ref={scrollRef}
        className={classNames("flex flex-col flex-grow flex-shrink overflow-y-auto home__scroller", {
          "home__scroller--fixed-menu": fixedTabs,
        })}
        onScroll={onScroll}
      >
        <Info address={address} balance={balance} chain={chain} refreshConnectionStatus={refreshConnectionStatus} />

        <TabList onDeleteAllIdentities={onDeleteAllIdentities}>
          <IdentityList />
        </TabList>
      </div>
    </div>
  );
};
