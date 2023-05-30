import { useCallback, useMemo, useState, MouseEvent as ReactMouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { EWallet, IUseWalletData } from "@src/types";
import { redirectToNewTab } from "@src/util/browser";

export interface IUseAccountMenuArgs {
  ethWallet: IUseWalletData;
  cryptKeeperWallet: IUseWalletData;
}

export interface IUseAccountMenuData {
  isOpen: boolean;
  accounts: { type: EWallet; address: string; active: boolean }[];
  anchorEl?: HTMLElement;
  onConnect: () => void;
  onDisconnect: () => void;
  onLock: () => void;
  onOpen: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onClose: () => void;
  onGoToMetamaskPage: () => void;
  onGoToSettings: () => void;
}

const METAMASK_INSTALL_URL = "https://metamask.io/";

export const useAccountMenu = ({ ethWallet, cryptKeeperWallet }: IUseAccountMenuArgs): IUseAccountMenuData => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  const navigate = useNavigate();

  const onOpen = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  const onClose = useCallback(() => {
    setAnchorEl(undefined);
  }, [setAnchorEl]);

  const onGoToMetamaskPage = useCallback(() => {
    redirectToNewTab(METAMASK_INSTALL_URL);
    onClose();
  }, [onClose]);

  const onGoToSettings = useCallback(() => {
    navigate(Paths.SETTINGS);
    onClose();
  }, [navigate, onClose]);

  const onLock = useCallback(() => {
    cryptKeeperWallet.onLock();
    onClose();
  }, [cryptKeeperWallet.onLock, onClose]);

  const onConnect = useCallback(() => {
    ethWallet.onConnect();
    onClose();
  }, [ethWallet.onConnect, onClose]);

  const onDisconnect = useCallback(() => {
    ethWallet.onDisconnect();
    onClose();
  }, [ethWallet.onDisconnect, onClose]);

  const isOpen = useMemo(() => Boolean(anchorEl), [Boolean(anchorEl)]);

  const ethAddresses = useMemo(
    () =>
      ethWallet.addresses?.map((address) => ({
        type: EWallet.ETH_WALLET,
        address: address.toLowerCase(),
        active: ethWallet.address === address,
      })) ?? [],
    [ethWallet.addresses, ethWallet.address],
  );

  const cryptKeeperAddresses = useMemo(
    () =>
      cryptKeeperWallet.addresses?.map((address) => ({
        type: EWallet.CRYPT_KEEPER_WALLET,
        address: address.toLowerCase(),
        active: cryptKeeperWallet.address === address,
      })) ?? [],
    [cryptKeeperWallet.addresses, cryptKeeperWallet.address],
  );

  const accounts = useMemo(() => ethAddresses.concat(cryptKeeperAddresses), [ethAddresses, cryptKeeperAddresses]);

  return {
    isOpen,
    anchorEl,
    accounts,
    onConnect,
    onDisconnect,
    onLock,
    onOpen,
    onClose,
    onGoToSettings,
    onGoToMetamaskPage,
  };
};
