import classNames from "classnames";
import { ReactNode, Children, useState, useMemo } from "react";

import { Icon } from "@src/ui/components/Icon";
import { Menuable } from "@src/ui/components/Menuable";
import { IdentityData } from "@src/ui/ducks/identities";

import "./tabListStyles.scss";

export interface TabListProps {
  children: ReactNode;
  identities: IdentityData[];
  onDeleteAllIdentities: () => void;
}

export const TabList = ({ children, identities, onDeleteAllIdentities }: TabListProps): JSX.Element => {
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

          {identities?.length ? (
            <Menuable
              className="flex user-menu"
              items={[{ label: "Delete All", isDangerItem: true, onClick: onDeleteAllIdentities }]}
            >
              <Icon className="tab__list__menu-icon" data-testid="menu-icon" fontAwesome="fas fa-ellipsis-h" />
            </Menuable>
          ) : null}
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
