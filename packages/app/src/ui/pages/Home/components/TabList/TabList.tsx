import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { type ReactNode, type SyntheticEvent, Children, useState, useMemo, useCallback } from "react";

import { getEnabledFeatures } from "@src/config/features";

import "./tabListStyles.scss";

export interface ITabListProps {
  children: ReactNode;
}

enum HomeTabs {
  IDENTITIES = 0,
  ACTIVITY = 1,
  VERIFIABLE_CREDENTIALS = 2,
}

export const TabList = ({ children }: ITabListProps): JSX.Element => {
  const features = getEnabledFeatures();
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
      <Tabs
        className="tab__list__tabs"
        indicatorColor="primary"
        textColor="primary"
        value={selectedTab}
        variant="fullWidth"
        onChange={onTabChange}
      >
        <Tab data-testid="tab-identities" label="Identities" />

        <Tab data-testid="tab-activity" label="Activity" />

        {features.VERIFIABLE_CREDENTIALS && <Tab data-testid="tab-credentials" label="Verifiable Credentials" />}
      </Tabs>

      {selectedContent}
    </div>
  );
};
