import classNames from "classnames";
import { useCallback } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import { RPCAction } from "@src/constants";
import loaderSvg from "@src/static/icons/loader.svg";
import logoSvg from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { Menuable } from "@src/ui/components/Menuable";
import { useWallet } from "@src/ui/hooks/wallet";
import postMessage from "@src/util/postMessage";

import "./header.scss";

export const Header = (): JSX.Element => {
  const { address, isActivating, isActive, chain, onConnect, onDisconnect } = useWallet();

  const openConnectWalletModal = useCallback(() => {
    postMessage({
      method: RPCAction.GET_CONNECT_WALLET_MODAL,
    });
  }, []);

  const onLock = useCallback(async () => {
    await postMessage({ method: RPCAction.LOCK });
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
                    onClick: onDisconnect,
                  }
                : {
                    label: "Connect wallet",
                    onClick: openConnectWalletModal,
                  },
              {
                label: "Lock",
                onClick: onLock,
              },
            ]}
          >
            {!address ? (
              <Icon
                fontAwesome={classNames({
                  "fas fa-plug": !isActivating,
                })}
                size={1.25}
                url={isActivating ? loaderSvg : undefined}
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
