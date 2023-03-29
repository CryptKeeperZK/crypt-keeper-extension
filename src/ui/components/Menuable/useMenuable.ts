import { useState, useEffect, useCallback, MouseEvent as ReactMouseEvent, ReactNode, useRef, RefObject } from "react";

export interface ItemProps {
  label: string;
  isDangerItem: boolean;
  iconUrl?: string;
  iconFA?: string;
  iconClassName?: string;
  className?: string;
  disabled?: boolean;
  children?: ItemProps[];
  component?: ReactNode;
  onClick?: (e: ReactMouseEvent, reset: () => void) => Promise<void> | void;
}

export interface IUseMenuableArgs {
  opened?: boolean;
  items: ItemProps[];
  onOpen?: () => void;
  onClose?: () => void;
}

export interface IUseMenuableData {
  menuRef: RefObject<HTMLDivElement>;
  isShowing: boolean;
  path: number[];
  menuItems: ItemProps[];
  isOpenDangerModal: boolean;
  onItemClick: (e: ReactMouseEvent, item: ItemProps, i: number) => void;
  handleClose: () => void;
  handleGoBack: (e: ReactMouseEvent) => void;
  handleOpen: () => void;
  handleSetDangerItem: (item: ItemProps, i: number) => void;
  handleDangerAction: (e: ReactMouseEvent) => void;
  handleDangerModalOpen: (e: ReactMouseEvent) => void;
  handleDangerModalClose: (e: ReactMouseEvent) => void;
}

export const useMenuable = ({ opened, items, onOpen, onClose }: IUseMenuableArgs): IUseMenuableData => {
  const [isShowing, setShowing] = useState(!!opened);
  const [path, setPath] = useState<number[]>([]);
  const [dangerItem, setDangerItem] = useState<ItemProps>();
  const [number, setNumber] = useState<number>(0);
  const [isOpenDangerModal, setOpenDangerModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleDangerModalOpen = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      setOpenDangerModal(true);
    },
    [isOpenDangerModal],
  );

  const handleDangerModalClose = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      setOpenDangerModal(false);
    },
    [isOpenDangerModal],
  );

  const handleSetDangerItem = useCallback(
    (item: ItemProps, i: number) => {
      setNumber(i);
      setDangerItem(item);
    },
    [dangerItem, number],
  );

  const handleDangerAction = useCallback(
    (e: ReactMouseEvent) => {
      e.stopPropagation();
      if (dangerItem) onItemClick(e, dangerItem, number);
      setOpenDangerModal(false);
    },
    [dangerItem],
  );

  useEffect(() => {
    if (typeof opened !== "undefined") {
      setShowing(opened);
      if (!opened) {
        setPath([]);
      }
    }
  }, [opened]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isShowing]);

  let menuItems: ItemProps[] = items;
  path?.forEach((index) => {
    if (items[index].children) {
      menuItems = items[index].children as ItemProps[];
    }
  });

  return {
    menuRef,
    isShowing,
    path,
    menuItems,
    isOpenDangerModal,
    onItemClick,
    handleClose,
    handleGoBack,
    handleOpen,
    handleSetDangerItem,
    handleDangerAction,
    handleDangerModalOpen,
    handleDangerModalClose,
  };
};
