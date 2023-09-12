import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { joinGroup } from "@src/ui/ducks/groups";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, useConnectedIdentity } from "@src/ui/ducks/identities";
import { useSearchParam, useUrlParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";
import { getBandadaGroupUrl } from "@src/util/groups";

import type { IIdentityData } from "@cryptkeeperzk/types";

export interface IUseJoinGroupData {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string;
  faviconUrl: string;
  groupId?: string;
  apiKey?: string;
  inviteCode?: string;
  connectedIdentity?: IIdentityData;
  onGoBack: () => void;
  onGoToHost: () => void;
  onGoToGroup: () => void;
  onJoin: () => void;
}

export const useJoinGroup = (): IUseJoinGroupData => {
  const [isLoading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const groupId = useUrlParam("id");
  const apiKey = useSearchParam("apiKey");
  const inviteCode = useSearchParam("inviteCode");

  const connectedIdentity = useConnectedIdentity();

  useEffect(() => {
    setLoading(true);
    dispatch(fetchIdentities())
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, setLoading, setError]);

  useEffect(() => {
    if (!connectedIdentity?.metadata.host) {
      return;
    }

    getLinkPreview(connectedIdentity.metadata.host)
      .then((data) => {
        setFaviconUrl(data.favicons[0]);
      })
      .catch(() => {
        setFaviconUrl("");
      });
  }, [connectedIdentity?.metadata.host, setFaviconUrl]);

  const onGoBack = useCallback(() => {
    dispatch(closePopup());
    navigate(Paths.HOME);
  }, [dispatch, navigate]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(connectedIdentity!.metadata.host!);
  }, [connectedIdentity?.metadata.host]);

  const onGoToGroup = useCallback(() => {
    redirectToNewTab(getBandadaGroupUrl(groupId!));
  }, [groupId]);

  const onJoin = useCallback(() => {
    setSubmitting(true);
    dispatch(joinGroup({ groupId: groupId!, apiKey, inviteCode }))
      .then(() => dispatch(closePopup()))
      .then(() => {
        navigate(Paths.HOME);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [groupId, apiKey, inviteCode, dispatch, navigate, setError, setSubmitting]);

  return {
    isLoading,
    isSubmitting,
    error,
    faviconUrl,
    connectedIdentity,
    groupId,
    apiKey,
    inviteCode,
    onGoBack,
    onGoToHost,
    onGoToGroup,
    onJoin,
  };
};
