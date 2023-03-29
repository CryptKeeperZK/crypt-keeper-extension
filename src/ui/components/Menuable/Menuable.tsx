import classNames from "classnames";
import { ReactNode } from "react";

import { ConfirmDangerModal } from "@src/ui/components/ConfirmDangerModal";

import { Icon } from "../Icon";

import "./menuable.scss";
import { useMeuable, ItemProps } from "./useMeunable";

export interface MenuableProps {
  items: ItemProps[];
  children?: ReactNode;
  className?: string;
  menuClassName?: string;
  opened?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const Menuable = ({
  opened,
  className,
  menuClassName,
  children,
  items,
  onOpen,
  onClose,
}: MenuableProps): JSX.Element => {
  const {
    menuRef,
    isShowing,
    path,
    menuItems,
    isOpenDangerModal,
    onItemClick,
    handleClose,
    handleGoBack,
    handleOpen,
    handleDangerAction,
    handleDangerModalClose,
    handleDangerModalOpen,
    handleSetDangerItem,
  } = useMeuable({
    opened,
    items,
    onOpen,
    onClose,
  });

  return (
    <div
      ref={menuRef}
      className={classNames("menuable", { "menuable--active": isShowing }, className)}
      data-testid="menu"
      onClick={(e) => {
        e.stopPropagation();

        if (isShowing) {
          handleClose();
        } else {
          handleOpen();
        }
      }}
    >
      {children}

      {isOpenDangerModal ? (
        <ConfirmDangerModal
          accept={handleDangerAction}
          isOpenModal={isOpenDangerModal}
          reject={handleDangerModalClose}
        />
      ) : null}

      {isShowing && (
        <div className={classNames("rounded-xl border border-gray-700 menuable__menu", menuClassName)}>
          {!!path.length && (
            <div
              className={classNames(
                "text-sm whitespace-nowrap cursor-pointer",
                "flex flex-row flex-nowrap items-center",
                "text-gray-500 hover:text-gray-300 hover:bg-gray-900 menuable__menu__item",
              )}
              onClick={handleGoBack}
            >
              <Icon fontAwesome="fas fa-caret-left" />

              <span className="ml-2">Go back</span>
            </div>
          )}

          {menuItems.map((item, i) => (
            <div key={i}>
              {item.isDangerItem ? (
                <div
                  key={item.label}
                  className={classNames(
                    "text-sm whitespace-nowrap",
                    "flex flex-row flex-nowrap items-center",
                    "menuable__menu__item hover:bg-gray-900 ",
                    { "cursor-pointer": !item.disabled },
                    item.className,
                  )}
                  onClick={(e) => {
                    handleSetDangerItem(item, i);
                    handleDangerModalOpen(e);
                  }}
                >
                  {item.component ? (
                    item.component
                  ) : (
                    <>
                      <div
                        className={classNames("flex-grow", {
                          "text-gray-500 hover:text-gray-300 hover:font-semibold": !item.disabled,
                          "text-gray-700": item.disabled,
                        })}
                      >
                        {item.label}
                      </div>

                      {(item.iconUrl || item.iconFA) && (
                        <Icon
                          className={classNames(
                            "ml-4",
                            {
                              "opacity-50": item.disabled,
                            },
                            item.iconClassName,
                          )}
                          fontAwesome={item.iconFA}
                          url={item.iconUrl}
                        />
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div
                  key={item.label}
                  className={classNames(
                    "text-sm whitespace-nowrap",
                    "flex flex-row flex-nowrap items-center",
                    "menuable__menu__item hover:bg-gray-900 ",
                    { "cursor-pointer": !item.disabled },
                    item.className,
                  )}
                  onClick={(e) => onItemClick(e, item, i)}
                >
                  {item.component ? (
                    item.component
                  ) : (
                    <>
                      <div
                        className={classNames("flex-grow", {
                          "text-gray-500 hover:text-gray-300 hover:font-semibold": !item.disabled,
                          "text-gray-700": item.disabled,
                        })}
                      >
                        {item.label}
                      </div>

                      {(item.iconUrl || item.iconFA) && (
                        <Icon
                          className={classNames(
                            "ml-4",
                            {
                              "opacity-50": item.disabled,
                            },
                            item.iconClassName,
                          )}
                          fontAwesome={item.iconFA}
                          url={item.iconUrl}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Menuable.defaultProps = {
  className: "",
  menuClassName: "",
  children: undefined,
  opened: false,
  onOpen: undefined,
  onClose: undefined,
};
