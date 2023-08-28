import { useState, useEffect, useCallback, MouseEvent as ReactMouseEvent, useRef, RefObject } from "react";

export interface ItemProps {
  label: string;
  isDangerItem: boolean;
  onClick: (e: ReactMouseEvent) => Promise<void> | void;
}

export interface IUseMenuArgs {
  items: ItemProps[];
}

export interface IUseMenuData {
  menuRef: RefObject<HTMLButtonElement>;
  isShowing: boolean;
  menuItems: ItemProps[];
  isOpenDangerModal: boolean;
  onItemClick: (event: ReactMouseEvent, item: ItemProps) => void;
  onShow: (event: ReactMouseEvent) => void;
  onSetDangerItem: (event: ReactMouseEvent, item: ItemProps) => void;
  onDangerAction: (event: ReactMouseEvent) => void;
  onDangerModalShow: (event: ReactMouseEvent) => void;
}

export const useMenu = ({ items }: IUseMenuArgs): IUseMenuData => {
  const [isShowing, setShowing] = useState(false);
  const [dangerItem, setDangerItem] = useState<ItemProps>();
  const [isOpenDangerModal, setOpenDangerModal] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setShowing(false);
  }, [setShowing]);

  const handleOpen = useCallback(() => {
    setShowing(true);

    const cb = () => {
      handleClose();
      window.removeEventListener("click", cb);
    };

    window.addEventListener("click", cb);
  }, [setShowing, handleClose]);

  const onShow = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();

      if (isShowing) {
        handleClose();
      } else {
        handleOpen();
      }
    },
    [isShowing, handleOpen, handleClose],
  );

  const onItemClick = useCallback(
    (event: ReactMouseEvent, item: ItemProps) => {
      item.onClick(event);
      handleClose();
    },
    [handleClose],
  );

  const onDangerModalShow = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();
      setOpenDangerModal((show) => !show);
    },
    [setOpenDangerModal],
  );

  const onSetDangerItem = useCallback(
    (event: ReactMouseEvent, item: ItemProps) => {
      handleClose();
      setDangerItem(item);
      onDangerModalShow(event);
    },
    [setDangerItem, handleClose, onDangerModalShow],
  );

  const onDangerAction = useCallback(
    (event: ReactMouseEvent) => {
      if (dangerItem) {
        onItemClick(event, dangerItem);
      }

      onDangerModalShow(event);
    },
    [dangerItem, onItemClick, onDangerModalShow],
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    },
    [menuRef, handleClose],
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isShowing, handleClickOutside]);

  return {
    menuRef,
    isShowing,
    menuItems: items,
    isOpenDangerModal,
    onItemClick,
    onShow,
    onSetDangerItem,
    onDangerAction,
    onDangerModalShow,
  };
};
