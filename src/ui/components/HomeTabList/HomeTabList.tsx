import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { type ReactNode, type SyntheticEvent, Children, useState, useMemo, useCallback } from "react";

import "./tabListStyles.scss";

export interface HomeTabListProps {
  children: ReactNode;
}

enum HomeTabs {
  IDENTITIES = 0,
  ACTIVITY = 1,
}

export const HomeTabList = ({ children }: HomeTabListProps): JSX.Element => {
  const [selectedTab, setSelectedTab] = useState(HomeTabs.IDENTITIES);

  const selectedContent = useMemo(() => Children.toArray(children)[selectedTab], [children, selectedTab]);

  const onTabChange = useCallback(
    (_: SyntheticEvent, value: HomeTabs) => {
      setSelectedTab(value);
    },
    [setSelectedTab],
  );

  return (
    <div className="tab__list" data-testid="tab-list">
      <Tabs indicatorColor="primary" textColor="primary" value={selectedTab} variant="fullWidth" onChange={onTabChange}>
        <Tab data-testid="tab-identities" label="Identities" />

        <Tab data-testid="tab-activity" label="Activity" />
      </Tabs>

      <div className="tab__list__content">{selectedContent}</div>
    </div>
  );
};
