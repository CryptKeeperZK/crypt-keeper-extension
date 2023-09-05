import { EWallet } from "@cryptkeeperzk/types";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { IUseWalletData } from "@src/types";
import { ellipsify } from "@src/util/account";
import { isExtensionPopupOpen } from "@src/util/browser";

import { useAccountMenu } from "./useAccountMenu";

export interface IAccountMenuProps {
  ethWallet: IUseWalletData;
  cryptKeeperWallet: IUseWalletData;
}

const WALLET_LABEL_BY_TYPE = {
  [EWallet.ETH_WALLET]: "MetaMask",
  [EWallet.CRYPTKEEPER_WALLET]: "CryptKeeper",
};

export const AccountMenu = ({ ethWallet, cryptKeeperWallet }: IAccountMenuProps): JSX.Element => {
  const {
    isOpen,
    accounts,
    anchorEl,
    onOpen,
    onClose,
    onConnect,
    onDisconnect,
    onLock,
    onGoToSettings,
    onGoToMetamaskPage,
    onSelectAccount,
    onOpenInNewTab,
  } = useAccountMenu({
    ethWallet,
    cryptKeeperWallet,
  });

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <IconButton data-testid="menu" disabled={!cryptKeeperWallet.address} onClick={onOpen}>
        {cryptKeeperWallet.address ? (
          <Jazzicon diameter={32} seed={jsNumberForAddress(cryptKeeperWallet.address)} />
        ) : (
          <Skeleton data-testid="address-loading" height={32} variant="circular" width={32} />
        )}
      </IconButton>

      <Menu anchorEl={anchorEl} open={isOpen} onClose={onClose}>
        {accounts.map((account) => (
          <MenuItem
            key={`${account.type}-${account.address}`}
            data-testid={`${account.type}-${account.address}`}
            sx={{ display: "flex", alignItems: "center", width: 200 }}
            onClick={
              account.type === EWallet.CRYPTKEEPER_WALLET
                ? () => {
                    onSelectAccount(account.address);
                  }
                : undefined
            }
          >
            <Jazzicon diameter={16} seed={jsNumberForAddress(account.address)} />

            <Box sx={{ ml: 1 }}>
              <Typography sx={{ fontSize: "0.7rem" }} variant="body2">
                {WALLET_LABEL_BY_TYPE[account.type]}
              </Typography>

              <Typography variant="body2">{ellipsify(account.address)}</Typography>

              {account.active && (
                <Badge
                  color="success"
                  sx={{
                    backgroundColor: "success.main",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 20,
                    right: 16,
                    height: 8,
                    width: 8,
                  }}
                />
              )}
            </Box>
          </MenuItem>
        ))}

        <Divider sx={{ backgroundColor: "background.paper" }} />

        {ethWallet.isActive && <MenuItem onClick={onDisconnect}>Disconnect MetaMask</MenuItem>}

        {ethWallet.isInjectedWallet ? (
          !ethWallet.isActive && <MenuItem onClick={onConnect}>Connect MetaMask</MenuItem>
        ) : (
          <MenuItem onClick={onGoToMetamaskPage}>Install MetaMask</MenuItem>
        )}

        {isExtensionPopupOpen() && <MenuItem onClick={onOpenInNewTab}>Open in new tab</MenuItem>}

        <MenuItem onClick={onGoToSettings}>Settings</MenuItem>

        <MenuItem onClick={onLock}>Lock</MenuItem>
      </Menu>
    </Box>
  );
};
