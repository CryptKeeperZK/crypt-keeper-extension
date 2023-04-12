import classNames from "classnames";

import { Header } from "@src/ui/components/Header";

import { IdentityList, TabList, Info } from "./components";
import "./home.scss";
import { useHome } from "./useHome";

const Home = (): JSX.Element => {
  const { address, chain, balance, identities, refreshConnectionStatus } = useHome();

  return (
    <div className="w-full h-full flex flex-col home" data-testid="home-page">
      <Header />

      <div className={classNames("flex flex-col flex-grow flex-shrink overflow-y-auto home__scroller")}>
        <Info address={address} balance={balance} chain={chain} refreshConnectionStatus={refreshConnectionStatus} />

        <TabList>
          <IdentityList identities={identities} />
        </TabList>
      </div>
    </div>
  );
};

export default Home;
