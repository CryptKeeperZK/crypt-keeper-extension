import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { type ReactNode, type SyntheticEvent, Children, useState, useMemo, useCallback } from "react";

import "./tabListStyles.scss";

export interface ConnectTabListProps {
  isShowTabs: boolean;
  children: ReactNode;
}

enum HomeTabs {
  CONNECTED = 0,
  RANDOM = 1,
}

export const ConnectTabList = ({ isShowTabs, children }: ConnectTabListProps): JSX.Element => {
  const [selectedTab, setSelectedTab] = useState(HomeTabs.CONNECTED);

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
        {isShowTabs && (
          <>
            <Tab data-testid="tab-identities" label="Linked" />

            <Tab data-testid="tab-activity" label="Unlinked" />
          </>
        )}
      </Tabs>

      <div className="tab__list__content">{selectedContent}</div>
    </div>
  );
};
