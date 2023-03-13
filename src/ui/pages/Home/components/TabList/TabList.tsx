import classNames from "classnames";
import { ReactNode, Children, useState, useMemo } from "react";

import { Icon } from "@src/ui/components/Icon";
import { Menuable } from "@src/ui/components/Menuable";

import "./tabListStyles.scss";

export interface TabListProps {
  children: ReactNode;
  onDeleteAllIdentities: () => void;
}

export const TabList = ({ children, onDeleteAllIdentities }: TabListProps): JSX.Element => {
  const [selectedTab] = useState(0);

  const selectedContent = useMemo(() => Children.toArray(children)[selectedTab], [children, selectedTab]);

  return (
    <div className="tab__list" data-testid="tab-list">
      <div className="tab__list__header">
        <div
          className={classNames("tab__list__header__tab", {
            "tab__list__header__tab--selected": selectedTab === 0,
          })}
        >
          <span>Identities</span>

          <Menuable className="flex user-menu" items={[{ label: "Delete all", onClick: onDeleteAllIdentities }]}>
            <Icon className="tab__list__menu-icon" data-testid="menu-icon" fontAwesome="fas fa-ellipsis-h" />
          </Menuable>
        </div>
      </div>

      <div className="tab__list__fix-header">
        <div
          className={classNames("tab__list__header__tab", {
            "tab__list__header__tab--selected": selectedTab === 0,
          })}
        >
          Identities
        </div>
      </div>

      <div className="tab__list__content">{selectedContent}</div>
    </div>
  );
};
