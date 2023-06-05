import classNames from "classnames";

import { Header } from "@src/ui/components/Header";
import { ActivityList } from "@src/ui/components/ActivityList";
import { HomeIdentityList } from "@src/ui/components/HomeIdentityList";
import { Info } from "@src/ui/components/Info";
import { HomeTabList } from "@src/ui/components/HomeTabList";

import "./home.scss";
import { useHome } from "./useHome";

const Home = (): JSX.Element => {
  const { identities, refreshConnectionStatus } = useHome();

  return (
    <div className="w-full h-full flex flex-col home" data-testid="home-page">
      <Header />

      <div className={classNames("flex flex-col flex-grow flex-shrink overflow-y-auto home__scroller")}>
        <Info refreshConnectionStatus={refreshConnectionStatus} />

        <HomeTabList>
          <HomeIdentityList identities={identities} />
          <ActivityList />
        </HomeTabList>
      </div>
    </div>
  );
};

export default Home;
