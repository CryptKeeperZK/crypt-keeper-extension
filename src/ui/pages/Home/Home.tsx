import classNames from "classnames";

import { Header } from "@src/ui/components/Header";

import { IdentityList, TabList, Info } from "./components";
import "./home.scss";
import { useHome } from "./useHome";

export const Home = (): JSX.Element => {
  const {
    scrollRef,
    fixedTabs,
    address,
    chain,
    balance,
    identities,
    refreshConnectionStatus,
    onDeleteAllIdentities,
    onScroll,
  } = useHome();

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

        <TabList identities={identities} onDeleteAllIdentities={onDeleteAllIdentities}>
          <IdentityList identities={identities} />
        </TabList>
      </div>
    </div>
  );
};
