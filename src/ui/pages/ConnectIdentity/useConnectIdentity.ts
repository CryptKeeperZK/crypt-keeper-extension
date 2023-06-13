import { getLinkPreview } from "link-preview-js";
import { type SyntheticEvent, useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { connectIdentity, fetchIdentities, useLinkedIdentities, useUnlinkedIdentities } from "@src/ui/ducks/identities";

import type { IdentityData } from "@src/types";

export interface IUseConnectIdentityData {
  host: string;
  faviconUrl: string;
  selectedTab: EConnectIdentityTabs;
  linkedIdentities: IdentityData[];
  unlinkedIdentities: IdentityData[];
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
  const host = useMemo(() => searchParams.get("host") as string, [searchParams.toString()]);

  const linkedIdentities = useLinkedIdentities(host);
  const unlinkedIdentities = useUnlinkedIdentities();

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
    dispatch(closePopup()).then(() => navigate(-1));
  }, [dispatch, navigate]);

  const onConnect = useCallback(async () => {
    await dispatch(connectIdentity({ identityCommitment: selectedIdentityCommitment as string, host }));
    await dispatch(closePopup()).then(() => navigate(-1));
  }, [selectedIdentityCommitment, host, dispatch]);

  useEffect(() => {
    dispatch(fetchIdentities());
  }, [dispatch]);

  useEffect(() => {
    if (unlinkedIdentities.length === 0) {
      setSelectedTab(EConnectIdentityTabs.LINKED);
    } else if (linkedIdentities.length === 0) {
      setSelectedTab(EConnectIdentityTabs.UNLINKED);
    }
  }, [linkedIdentities.length, unlinkedIdentities.length, setSelectedTab]);

  useEffect(() => {
    getLinkPreview(host)
      .then((data) => {
        const [favicon] = data.favicons;
        setFaviconUrl(favicon);
      })
      .catch(() => undefined);
  }, [host]);

  return {
    host,
    faviconUrl,
    selectedTab,
    linkedIdentities,
    unlinkedIdentities,
    selectedIdentityCommitment,
    onTabChange,
    onReject,
    onConnect,
    onSelectIdentity,
  };
};
