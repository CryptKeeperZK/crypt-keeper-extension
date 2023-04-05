import classNames from "classnames";
import { useCallback } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { browser } from "webextension-polyfill-ts";

import loaderSvg from "@src/static/icons/loader.svg";
import logoSvg from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { Menuable } from "@src/ui/components/Menuable";
import { useWallet } from "@src/ui/hooks/wallet";

import "./header.scss";

const METAMASK_INSTALL_URL = "https://metamask.io/";

export const Header = (): JSX.Element => {
  const { address, isActivating, isActive, isInjectedWallet, chain, onConnect, onDisconnect, onLock } = useWallet();
  const isLoading = isActivating && isInjectedWallet;

  const onGoToMetamaskPage = useCallback(() => {
    browser.tabs.create({ url: METAMASK_INSTALL_URL });
  }, []);

  return (
    <div className="header h-16 flex flex-row items-center px-4">
      <Icon size={3} url={logoSvg} />

      <div className="flex-grow flex flex-row items-center justify-end header__content">
        {chain && <div className="text-sm rounded-full header__network-type">{chain.name}</div>}

        <div className="header__account-icon">
          <Menuable
            className="flex user-menu"
            items={[
              isActive
                ? {
                    label: "Disconnect wallet",
                    isDangerItem: false,
                    onClick: onDisconnect,
                  }
                : {
                    label: isInjectedWallet ? "Connect wallet" : "Install metamask",
                    isDangerItem: false,
                    onClick: isInjectedWallet ? onConnect : onGoToMetamaskPage,
                  },
              {
                label: "Lock",
                isDangerItem: false,
                onClick: onLock,
              },
            ]}
          >
            {!address ? (
              <Icon
                data-testid={`inactive-wallet-icon${isLoading ? "-activating" : ""}`}
                fontAwesome={classNames({
                  "fas fa-plug": !isLoading,
                })}
                size={1.25}
                url={isLoading ? loaderSvg : undefined}
              />
            ) : (
              <Jazzicon diameter={32} seed={jsNumberForAddress(address)} />
            )}
          </Menuable>
        </div>
      </div>
    </div>
  );
};
