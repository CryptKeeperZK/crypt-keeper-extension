import { useState, useEffect, useCallback, MouseEvent as ReactMouseEvent } from "react";
import { ItemProps } from ".";

export interface IUseMeuableArgs {
  opened?: boolean;
  items: ItemProps[];
  onOpen?: () => void;
  onClose?: () => void;
}

export interface IUseMenuableData {
  isShowing: boolean;
  path: number[];
  menuItems: ItemProps[];
  onItemClick: (e: ReactMouseEvent, item: ItemProps, i: number) => void;
  handleClose: () => void;
  handleGoBack: (e: ReactMouseEvent) => void;
  handleOpen: () => void;
}

export const useMeuable = ({ opened, items, onOpen, onClose }: IUseMeuableArgs): IUseMenuableData => {
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

  return {
    isShowing,
    path,
    menuItems,
    onItemClick,
    handleClose,
    handleGoBack,
    handleOpen,
  };
};
