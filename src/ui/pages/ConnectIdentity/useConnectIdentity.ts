import { getLinkPreview } from "link-preview-js";
import { type SyntheticEvent, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import type { IdentityData } from "@src/types";

export interface IUseConnectIdentityData {
  host: string;
  faviconUrl: string;
  selectedTab: EConnectIdentityTabs;
  linkedIdentities: IdentityData[];
  unlinkedIdentities: IdentityData[];
  isShowTabs: boolean;
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
  // get data
  const host = "http://localhost:3000";
  const linkedIdentities: IdentityData[] = [
    {
      commitment: "1234",
      metadata: {
        identityStrategy: "random",
        account: ZERO_ADDRESS,
        name: "Account #1",
        groups: [],
        host: "http://localhost:3000",
      },
    },
  ];
  const unlinkedIdentities: IdentityData[] = [
    {
      commitment: "4321",
      metadata: {
        identityStrategy: "random",
        account: ZERO_ADDRESS,
        name: "Account #2",
        groups: [],
      },
    },
  ];

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

  const onConnect = useCallback(() => {
    // implement
  }, []);

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
    isShowTabs: linkedIdentities.length > 0 && unlinkedIdentities.length > 0,
    selectedIdentityCommitment,
    onTabChange,
    onReject,
    onConnect,
    onSelectIdentity,
  };
};
