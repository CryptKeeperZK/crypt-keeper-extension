import classNames from "classnames";
import { MouseEvent as ReactMouseEvent, ReactNode, useCallback, useEffect, useState } from "react";

import { Icon } from "../Icon";

import "./menuable.scss";

export interface MenuableProps {
  items: ItemProps[];
  children?: ReactNode;
  className?: string;
  menuClassName?: string;
  opened?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface ItemProps {
  label: string;
  iconUrl?: string;
  iconFA?: string;
  iconClassName?: string;
  className?: string;
  disabled?: boolean;
  children?: ItemProps[];
  component?: ReactNode;
  onClick?: (e: ReactMouseEvent, reset: () => void) => Promise<void> | void;
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
  const [isShowing, setShowing] = useState(!!opened);
  const [path, setPath] = useState<number[]>([]);

  useEffect(() => {
    if (typeof opened !== "undefined") {
      setShowing(opened);
      if (!opened) {
        setPath([]);
      }
    }
  }, [opened]);

  const handleClose = useCallback(() => {
    onClose?.();
    setShowing(false);
  }, []);

  const handleOpen = useCallback(() => {
    onOpen?.();
    setShowing(true);

    const cb = () => {
      handleClose();
      window.removeEventListener("click", cb);
    };

    window.addEventListener("click", cb);
  }, [handleClose]);

  const handleGoBack = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      const newPath = [...path];
      newPath.pop();
      setPath(newPath);
    },
    [path],
  );

  const onItemClick = useCallback(
    (e: ReactMouseEvent, item: ItemProps, i: number) => {
      e.stopPropagation();
      if (item.disabled) return;
      if (item.children) {
        setPath([...path, i]);
      } else if (item.onClick) {
        item.onClick(e, () => setPath([]));
        handleClose();
      }
    },
    [path, handleClose, setPath],
  );

  let menuItems: ItemProps[] = items;
  path?.forEach((index) => {
    if (items[index].children) {
      menuItems = items[index].children as ItemProps[];
    }
  });

  return (
    <div
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
