import { IConnectIdentityArgs, IIdentityData, IPendingRequest } from "@cryptkeeperzk/types";
import { getLinkPreview } from "link-preview-js";
import { type SyntheticEvent, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  connectIdentity,
  fetchIdentities,
  useConnectedIdentity,
  useLinkedIdentities,
  useUnlinkedIdentities,
} from "@src/ui/ducks/identities";

export interface IUseConnectionModalArgs {
  pendingRequest: IPendingRequest<{ urlOrigin: string }>;
  accept: (data?: unknown) => void;
  reject: (err?: Error) => void;
}

export interface IUseConnectIdentityData {
  urlOrigin: string;
  faviconUrl: string;
  selectedTab: EConnectIdentityTabs;
  linkedIdentities: IIdentityData[];
  unlinkedIdentities: IIdentityData[];
  selectedIdentityCommitment?: string;
  onTabChange: (event: SyntheticEvent, value: EConnectIdentityTabs) => void;
  onSelectIdentity: (identityCommitment: string) => void;
  openCreateIdentityModal: boolean;
  onCreateIdentityModalShow: (event?: React.MouseEvent<HTMLAnchorElement>) => void;
  onReject: () => void;
  onAccept: () => void;
}

export enum EConnectIdentityTabs {
  LINKED,
  UNLINKED,
}

export const useConnectIdentity = ({
  pendingRequest,
  accept,
  reject,
}: IUseConnectionModalArgs): IUseConnectIdentityData => {
  const { payload } = pendingRequest;
  const urlOrigin = payload?.urlOrigin ?? "";

  const connectedIdentity = useConnectedIdentity();
  const linkedIdentities = useLinkedIdentities(urlOrigin);
  const unlinkedIdentities = useUnlinkedIdentities();

  const [faviconUrl, setFaviconUrl] = useState("");
  const [openCreateIdentityModal, setOpenCreateIdentityModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<EConnectIdentityTabs>(EConnectIdentityTabs.LINKED);
  const [selectedIdentityCommitment, setSelectedIdentityCommitment] = useState<string>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onCreateIdentityModalShow = useCallback(
    (event?: React.MouseEvent<HTMLAnchorElement>) => {
      if (event) {
        event.stopPropagation();
      }

      setOpenCreateIdentityModal((show) => !show);
    },
    [setOpenCreateIdentityModal],
  );

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
    reject();
  }, [dispatch, navigate, reject]);

  const onAccept = useCallback(async () => {
    const connectedIdentityArgs: IConnectIdentityArgs = {
      identityCommitment: selectedIdentityCommitment!,
      urlOrigin,
    };
    await dispatch(connectIdentity(connectedIdentityArgs));
    accept(connectedIdentityArgs);
  }, [selectedIdentityCommitment, urlOrigin, dispatch, accept]);

  useEffect(() => {
    dispatch(fetchIdentities());
  }, [dispatch, setOpenCreateIdentityModal, openCreateIdentityModal]);

  useEffect(() => {
    if (connectedIdentity?.commitment) {
      setSelectedIdentityCommitment(connectedIdentity.commitment);
    }
  }, [connectedIdentity?.commitment]);

  useEffect(() => {
    if (unlinkedIdentities.length === 0) {
      setSelectedTab(EConnectIdentityTabs.LINKED);
    } else if (linkedIdentities.length === 0) {
      setSelectedTab(EConnectIdentityTabs.UNLINKED);
    }
  }, [linkedIdentities.length, unlinkedIdentities.length, setSelectedTab]);

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
    linkedIdentities,
    unlinkedIdentities,
    selectedIdentityCommitment,
    onTabChange,
    onReject,
    openCreateIdentityModal,
    onCreateIdentityModalShow,
    onAccept,
    onSelectIdentity,
  };
};
