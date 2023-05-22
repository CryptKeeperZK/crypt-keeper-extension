import Box from "@mui/material/Box";
import classNames from "classnames";
import { ReactNode } from "react";

import { ConfirmDangerModal } from "@src/ui/components/ConfirmDangerModal";

import "./menuable.scss";
import { MenuItem } from "./MenuItem";
import { useMenuable, ItemProps } from "./useMenuable";

export interface MenuableProps {
  items: ItemProps[];
  children: ReactNode;
  className: string;
  menuClassName?: string;
}

export const Menuable = ({ items, children, className, menuClassName = "" }: MenuableProps): JSX.Element => {
  const {
    menuRef,
    isShowing,
    menuItems,
    isOpenDangerModal,
    onShow,
    onItemClick,
    onDangerAction,
    onDangerModalShow,
    onSetDangerItem,
  } = useMenuable({
    items,
  });

  return (
    <Box
      ref={menuRef}
      className={classNames("menuable", { "menuable--active": isShowing }, className)}
      component="button"
      data-testid="menu"
      type="button"
      onClick={onShow}
    >
      {children}

      <ConfirmDangerModal accept={onDangerAction} isOpenModal={isOpenDangerModal} reject={onDangerModalShow} />

      {isShowing && (
        <div className={classNames("rounded-xl border border-gray-700 menuable__menu", menuClassName)}>
          {menuItems.map((item) => (
            <MenuItem key={item.label} item={item} onItemClick={onItemClick} onSetDangerItem={onSetDangerItem} />
          ))}
        </div>
      )}
    </Box>
  );
};
