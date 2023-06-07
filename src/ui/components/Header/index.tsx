import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import logoSvg from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";

import { AccountMenu } from "../AccountMenu";

import "./header.scss";

export const Header = (): JSX.Element => {
  const ethWallet = useEthWallet();
  const cryptKeeperWallet = useCryptKeeperWallet();
  const navigate = useNavigate();

  const onGoToHome = useCallback(() => {
    navigate(Paths.HOME);
  }, [navigate]);

  return (
    <div className="header h-16 flex flex-row items-center px-4">
      <Icon data-testid="logo" size={3} url={logoSvg} onClick={onGoToHome} />

      <div className="flex-grow flex flex-row items-center justify-end header__content">
        {ethWallet.isActive && <div className="text-sm rounded-full header__network-type">Connected to Metamask</div>}

        <div className="header__account-icon">
          <AccountMenu cryptKeeperWallet={cryptKeeperWallet} ethWallet={ethWallet} />
        </div>
      </div>
    </div>
  );
};
