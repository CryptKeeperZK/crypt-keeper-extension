import { type RefObject, useRef, useState, useCallback } from "react";

export interface IUseDropdownButtonArgs {
  onClick: (index: number) => void;
}

export interface IUseDropdownButtonData {
  menuRef: RefObject<HTMLDivElement>;
  selectedIndex: number;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onMenuItemClick: (index: number) => void;
  onSubmit: () => void;
}

export const useDropdownButton = ({ onClick }: IUseDropdownButtonArgs): IUseDropdownButtonData => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onToggleMenu = useCallback(() => {
    setIsMenuOpen((isOpen) => !isOpen);
  }, [setIsMenuOpen]);

  const onMenuItemClick = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      setIsMenuOpen(false);
    },
    [setIsMenuOpen, setSelectedIndex],
  );

  const onSubmit = useCallback(() => {
    onClick(selectedIndex);
  }, [selectedIndex, onClick]);

  return {
    isMenuOpen,
    selectedIndex,
    menuRef,
    onToggleMenu,
    onMenuItemClick,
    onSubmit,
  };
};
