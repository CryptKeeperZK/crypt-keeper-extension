import React, { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import postMessage from "@src/util/postMessage";
import RPCAction from "@src/util/constants";
import { useAccount, useBalance, useNetwork } from "@src/ui/ducks/web3";
import Icon from "@src/ui/components/Icon";
import {
  deleteIdentity,
  fetchIdentities,
  setActiveIdentity,
  setIdentityName,
  useIdentities,
  useSelectedIdentity,
} from "@src/ui/ducks/identities";
import Header from "@src/ui/components/Header";
import classNames from "classnames";
import { browser } from "webextension-polyfill-ts";
import "./home.scss";
import { ellipsify, sliceAddress } from "@src/util/account";
import CreateIdentityModal from "@src/ui/components/CreateIdentityModal";
import ConnectionModal from "@src/ui/components/ConnectionModal";
import Menuable from "@src/ui/components/Menuable";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useMetaMaskConnect, useMetaMaskWalletInfo } from "@src/ui/services/useMetaMask";

export default function Home(): ReactElement {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fixedTabs, fixTabs] = useState(false);

  useEffect(() => {
    (async () => {
      dispatch(fetchIdentities());
      await useMetaMaskConnect();
      await useMetaMaskWalletInfo();
    })();
  }, []);

  const onScroll = useCallback(async () => {
    if (!scrollRef.current) return;

    const scrollTop = scrollRef.current?.scrollTop;

    fixTabs(scrollTop > 92);
  }, [scrollRef]);

  return (
    <div className="w-full h-full flex flex-col home">
      <Header />
      <div
        ref={scrollRef}
        className={classNames("flex flex-col flex-grow flex-shrink overflow-y-auto home__scroller", {
          "home__scroller--fixed-menu": fixedTabs,
        })}
        onScroll={onScroll}
      >
        <HomeInfo />
        <HomeList />
      </div>
    </div>
  );
}

const HomeInfo = function (): ReactElement {
  const network = useNetwork();
  const balance = useBalance();
  const account = useAccount();
  const [connected, setConnected] = useState(false);
  const [showingModal, showModal] = useState(false);

  useEffect(() => {
    (async () => {
      await refreshConnectionStatus();
    })();
  }, []);

  const refreshConnectionStatus = useCallback(async () => {
    try {
      const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
      const [tab] = tabs || [];

      if (tab?.url) {
        const { origin } = new URL(tab.url);
        const isHostApproved = await postMessage({
          method: RPCAction.IS_HOST_APPROVED,
          payload: origin,
        });

        setConnected(isHostApproved);
      }
    } catch (e) {
      setConnected(false);
    }
  }, []);

  return (
    <>
      {showingModal && (
        <ConnectionModal onClose={() => showModal(false)} refreshConnectionStatus={refreshConnectionStatus} />
      )}
      <div className="home__info">
        <div
          className={classNames("home__connection-button", {
            "home__connection-button--connected": connected,
          })}
          onClick={connected ? () => showModal(true) : undefined}
        >
          <div
            className={classNames("home__connection-button__icon", {
              "home__connection-button__icon--connected": connected,
            })}
          />
          <div className="text-xs home__connection-button__text">{connected ? "Connected" : "Not Connected"}</div>
          {account && <div className="text-sm home__account-button">{sliceAddress(account)}</div>}
        </div>
        <div>
          <div className="text-3xl font-semibold">{network ? `${balance} ${network.nativeCurrency.symbol}` : "-"}</div>
        </div>
      </div>
    </>
  );
};

var HomeList = function (): ReactElement {
  const [selectedTab, selectTab] = useState<"identities" | "activity">("identities");

  return (
    <div className="home__list">
      <div className="home__list__header">
        <div
          className={classNames("home__list__header__tab", {
            "home__list__header__tab--selected": selectedTab === "identities",
          })}
          onClick={() => selectTab("identities")}
        >
          Identities
        </div>
        <div
          className={classNames("home__list__header__tab", {
            "home__list__header__tab--selected": selectedTab === "activity",
          })}
          onClick={() => selectTab("activity")}
        >
          Activity
        </div>
      </div>
      <div className="home__list__fix-header">
        <div
          className={classNames("home__list__header__tab", {
            "home__list__header__tab--selected": selectedTab === "identities",
          })}
          onClick={() => selectTab("identities")}
        >
          Identities
        </div>
        <div
          className={classNames("home__list__header__tab", {
            "home__list__header__tab--selected": selectedTab === "activity",
          })}
          onClick={() => selectTab("activity")}
        >
          Activity
        </div>
      </div>
      <div className="home__list__content">
        {selectedTab === "identities" ? <IdentityList /> : null}
        {selectedTab === "activity" ? <ActivityList /> : null}
      </div>
    </div>
  );
};

var IdentityList = function (): ReactElement {
  const identities = useIdentities();
  const selected = useSelectedIdentity();
  const dispatch = useAppDispatch();
  const account = useAccount();

  const [showingModal, setShowModal] = useState<boolean>(false);
  const [renameInput, setRenameInput] = useState<Map<string, boolean>>(new Map());
  const [nameInput, setNameInput] = useState<string>();
  const [deleteIdentityState, setDeleteIdentityState] = useState(false);

  const updateSetRenameMap = (key, value) => {
    setRenameInput(map => new Map(map.set(key, value)));
  };

  const selectIdentity = useCallback(async (identityCommitment: string) => {
    dispatch(setActiveIdentity(identityCommitment));
  }, []);
  const changeIdentityNameButton = useCallback(async (identityCommitment: string, name: string | undefined) => {
    if (name) {
      await dispatch(setIdentityName(identityCommitment, name));
      updateSetRenameMap(identityCommitment, false);
    }
  }, []);
  const deleteIdentityButton = useCallback(async (identityCommitment: string) => {
    await dispatch(deleteIdentity(identityCommitment));
    setDeleteIdentityState(true);
  }, []);

  const handleNameInput = (event: any) => {
    const value = event.target.value;
    setNameInput(value);
  };

  const handleKeypress = (e: any, commitment: string, name: string | undefined) => {
    console.log("handleKeypress", e.key);
    if (e.key === "Enter") {
      if (name) {
        changeIdentityNameButton(commitment, name);
        3;
      }
    }
  };

  useEffect(() => {
    dispatch(fetchIdentities());
    setDeleteIdentityState(false);
  }, [renameInput, deleteIdentityState]);

  return (
    <>
      {showingModal && <CreateIdentityModal onClose={() => setShowModal(false)} />}
      {identities.map(({ commitment, metadata }, i) => {
        return (
          <div className="p-4 identity-row" key={commitment}>
            <Icon
              className={classNames("identity-row__select-icon", {
                "identity-row__select-icon--selected": selected.commitment === commitment,
              })}
              fontAwesome="fas fa-check"
              onClick={() => selectIdentity(commitment)}
            />
            <div className="flex flex-col flex-grow">
              {renameInput?.get(commitment) ? (
                <div className="flex flex-row items-center text-lg font-semibold">
                  <input
                    className="identity-row__input-field"
                    type="text"
                    value={nameInput}
                    onChange={handleNameInput}
                  />
                  <Icon
                    className="identity-row__select-icon--selected mr-2"
                    fontAwesome="fa-solid fa-check"
                    size={1}
                    onClick={() => changeIdentityNameButton(commitment, nameInput)}
                    // TODO: support Enter press for renaming
                    //onKeyPress={changeIdentityNameButton}
                  />
                </div>
              ) : (
                <div className="flex flex-row items-center text-lg font-semibold">
                  {`${metadata.name}`}
                  <span className="text-xs py-1 px-2 ml-2 rounded-full bg-gray-500 text-gray-800">
                    {metadata.web2Provider}
                  </span>
                </div>
              )}
              <div className="text-base text-gray-500">{ellipsify(commitment)}</div>
            </div>
            <Menuable
              className="flex user-menu"
              items={[
                {
                  label: "Rename",
                  onClick: () => {
                    setNameInput(metadata.name);
                    updateSetRenameMap(commitment, true);
                  },
                },
                {
                  label: "Delete",
                  onClick: () => deleteIdentityButton(commitment),
                },
              ]}
            >
              <Icon className="identity-row__menu-icon" fontAwesome="fas fa-ellipsis-h" />
            </Menuable>
          </div>
        );
      })}
      {account ? (
        <div
          className="create-identity-row__active flex flex-row items-center justify-center p-4 cursor-pointer text-gray-600"
          onClick={() => setShowModal(true)}
        >
          <Icon fontAwesome="fas fa-plus" size={1} className="mr-2" />
          <div>Add Identity</div>
        </div>
      ) : (
        <div className="create-identity-row__not-active flex flex-row items-center justify-center p-4 cursor-pointer text-gray-600">
          <Icon fontAwesome="fas fa-plus" size={1} className="mr-2" />
          <div>Add Identity</div>
        </div>
      )}
    </>
  );
};

var ActivityList = function (): ReactElement {
  return <div />;
};
