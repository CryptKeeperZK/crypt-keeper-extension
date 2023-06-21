import Box from "@mui/material/Box";
import classNames from "classnames";
import { useCallback, type MouseEvent as ReactMouseEvent } from "react";

import { ItemProps } from "./useMenuable";

export interface IMenuItemProps {
  item: ItemProps;
  onSetDangerItem: (event: ReactMouseEvent, item: ItemProps) => void;
  onItemClick: (event: ReactMouseEvent, item: ItemProps) => void;
}

export const MenuItem = ({ item, onSetDangerItem, onItemClick }: IMenuItemProps): JSX.Element => {
  const handleDangerItemClick = useCallback(
    (event: ReactMouseEvent) => {
      onSetDangerItem(event, item);
    },
    [item, onSetDangerItem],
  );

  const handleItemClick = useCallback(
    (event: ReactMouseEvent) => {
      onItemClick(event, item);
    },
    [item, onItemClick],
  );

  if (item.isDangerItem) {
    return (
      <Box
        className={classNames(
          "text-sm whitespace-nowrap",
          "flex flex-row flex-nowrap items-center",
          "menuable__menu__item hover:bg-gray-900 ",
          "cursor-pointer",
        )}
        onClick={handleDangerItemClick}
      >
        <div className={classNames("flex-grow", "text-gray-500 hover:text-gray-300 hover:font-semibold")}>
          {item.label}
        </div>
      </Box>
    );
  }

  return (
    <Box
      className={classNames(
        "text-sm whitespace-nowrap",
        "flex flex-row flex-nowrap items-center",
        "menuable__menu__item hover:bg-gray-900 ",
        "cursor-pointer",
      )}
      onClick={handleItemClick}
    >
      <div className={classNames("flex-grow", "text-gray-500 hover:text-gray-300 hover:font-semibold")}>
        {item.label}
      </div>
    </Box>
  );
};
