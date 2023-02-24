import React, { ReactElement, useCallback } from "react";
import Icon from "@src/ui/components/Icon";
import LogoSVG from "@src/static/icons/logo.svg";
import LoaderSVG from "@src/static/icons/loader.svg";
import postMessage from "@src/util/postMessage";
import RPCAction from "@src/util/constants";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import "./header.scss";
import classNames from "classnames";
import Menuable from "@src/ui/components/Menuable";
import { useWallet } from "@src/ui/hooks/wallet";
import log from "loglevel";

export default function Header(): ReactElement {
  const { address, isActivating, chain, connector } = useWallet();

  const connectMetamask = useCallback(async () => {
    log.debug("Inside connectMetamask button");
    connector?.activate();
  }, [connector]);

  const lock = useCallback(async () => {
    await postMessage({ method: RPCAction.LOCK });
  }, []);

  return (
    <div className="header h-16 flex flex-row items-center px-4">
      <Icon url={LogoSVG} size={3} />
      <div className="flex-grow flex flex-row items-center justify-end header__content">
        {chain && <div className="text-sm rounded-full header__network-type">{chain.name}</div>}
        <div className="header__account-icon">
          {address ? (
            <Menuable
              className="flex user-menu"
              items={[
                {
                  label: "Lock",
                  onClick: lock,
                },
              ]}
            >
              <Jazzicon diameter={32} seed={jsNumberForAddress(address)} />
            </Menuable>
          ) : (
            <div title="Connect to Metamask" onClick={connectMetamask}>
              <Icon
                fontAwesome={classNames({
                  "fas fa-plug": !isActivating,
                })}
                url={isActivating ? LoaderSVG : undefined}
                size={1.25}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
