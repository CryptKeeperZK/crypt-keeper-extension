import { IIdentityData } from "@cryptkeeperzk/types";
import { getLinkPreview } from "link-preview-js";
import { type SyntheticEvent, useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { connect, fetchConnections, useConnectedOrigins, useConnection } from "@src/ui/ducks/connections";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, useIdentities } from "@src/ui/ducks/identities";

export interface IUseConnectIdentityData {
  urlOrigin: string;
  faviconUrl: string;
  selectedTab: EConnectIdentityTabs;
  identities: IIdentityData[];
  connectedOrigins: Record<string, string>;
  selectedIdentityCommitment?: string;
  onTabChange: (event: SyntheticEvent, value: EConnectIdentityTabs) => void;
  onSelectIdentity: (identityCommitment: string) => void;
  onReject: () => void;
  onConnect: () => void;
}

export enum EConnectIdentityTabs {
  LINKED,
  UNLINKED,
}

export const useConnectIdentity = (): IUseConnectIdentityData => {
  const { searchParams } = new URL(window.location.href.replace("#", ""));
  const urlOrigin = useMemo(() => searchParams.get("urlOrigin")!, [searchParams.toString()]);

  const connection = useConnection(urlOrigin);
  const identities = useIdentities();
  const connectedOrigins = useConnectedOrigins();

  const [faviconUrl, setFaviconUrl] = useState("");
  const [selectedTab, setSelectedTab] = useState<EConnectIdentityTabs>(EConnectIdentityTabs.LINKED);
  const [selectedIdentityCommitment, setSelectedIdentityCommitment] = useState<string>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onTabChange = useCallback(
    (_: SyntheticEvent, value: EConnectIdentityTabs) => {
      setSelectedTab(value);
    },
    [setSelectedTab],
  );

  const onSelectIdentity = useCallback(
    (identityCommitment: string) => {
      setSelectedIdentityCommitment(identityCommitment);
    },
    [setSelectedIdentityCommitment],
  );

  const onReject = useCallback(() => {
    dispatch(closePopup()).then(() => {
      navigate(Paths.HOME);
    });
  }, [dispatch, navigate]);

  const onConnect = useCallback(async () => {
    await dispatch(connect({ commitment: selectedIdentityCommitment!, urlOrigin }));
    await dispatch(closePopup()).then(() => {
      navigate(Paths.HOME);
    });
  }, [selectedIdentityCommitment, urlOrigin, dispatch]);

  useEffect(() => {
    dispatch(fetchIdentities());
    dispatch(fetchConnections());
  }, [dispatch]);

  useEffect(() => {
    if (connection?.commitment) {
      setSelectedIdentityCommitment(connection.commitment);
    }
  }, [connection?.commitment]);

  useEffect(() => {
    getLinkPreview(urlOrigin)
      .then((data) => {
        const [favicon] = data.favicons;
        setFaviconUrl(favicon);
      })
      .catch(() => undefined);
  }, [urlOrigin]);

  return {
    urlOrigin,
    faviconUrl,
    selectedTab,
    identities,
    connectedOrigins,
    selectedIdentityCommitment,
    onTabChange,
    onReject,
    onConnect,
    onSelectIdentity,
  };
};
