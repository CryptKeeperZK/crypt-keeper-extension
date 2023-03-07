import classNames from "classnames";
import { useCallback } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import Icon from "@src/ui/components/Icon";
import RPCAction from "@src/util/constants";
import logoSvg from "@src/static/icons/logo.svg";
import loaderSvg from "@src/static/icons/loader.svg";
import postMessage from "@src/util/postMessage";
import { useWallet } from "@src/ui/hooks/wallet";
import "./header.scss";
import Menuable from "@src/ui/components/Menuable";

export default function Header(): JSX.Element {
  const { address, isActivating, isActive, chain, onConnect, onDisconnect } = useWallet();

  const onLock = useCallback(async () => {
    await postMessage({ method: RPCAction.LOCK });
  }, []);

  return (
    <div className="header h-16 flex flex-row items-center px-4">
      <Icon url={logoSvg} size={3} />

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
                    onClick: onConnect,
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
                url={isActivating ? loaderSvg : undefined}
                size={1.25}
              />
            ) : (
              <Jazzicon diameter={32} seed={jsNumberForAddress(address)} />
            )}
          </Menuable>
        </div>
      </div>
    </div>
  );
}
