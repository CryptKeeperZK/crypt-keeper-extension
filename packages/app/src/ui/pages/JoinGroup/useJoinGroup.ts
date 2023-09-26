import { EventName } from "@cryptkeeperzk/providers";
import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { checkGroupMembership, joinGroup } from "@src/ui/ducks/groups";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, useConnectedIdentity } from "@src/ui/ducks/identities";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";
import { getBandadaGroupUrl } from "@src/util/groups";

import type { IIdentityData } from "@cryptkeeperzk/types";

export interface IUseJoinGroupData {
  isLoading: boolean;
  isJoined: boolean;
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
  const [isJoined, setJoined] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const groupId = useSearchParam("groupId");
  const apiKey = useSearchParam("apiKey");
  const inviteCode = useSearchParam("inviteCode");

  const connectedIdentity = useConnectedIdentity();

  useEffect(() => {
    setLoading(true);
    Promise.all([dispatch(fetchIdentities()), dispatch(checkGroupMembership({ groupId: groupId! }))])
      .then(([, isJoinedToGroup]) => {
        setJoined(isJoinedToGroup);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [groupId, dispatch, setLoading, setError]);

  useEffect(() => {
    if (!connectedIdentity?.metadata.urlOrigin) {
      return;
    }

    getLinkPreview(connectedIdentity.metadata.urlOrigin)
      .then((data) => {
        setFaviconUrl(data.favicons[0]);
      })
      .catch(() => {
        setFaviconUrl("");
      });
  }, [connectedIdentity?.metadata.urlOrigin, setFaviconUrl]);

  const onGoBack = useCallback(() => {
    dispatch(
      rejectUserRequest({ type: EventName.JOIN_GROUP, payload: { groupId } }, connectedIdentity?.metadata.urlOrigin),
    )
      .then(() => dispatch(closePopup()))
      .then(() => {
        navigate(Paths.HOME);
      });
  }, [groupId, connectedIdentity?.metadata.urlOrigin, dispatch, navigate]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(connectedIdentity!.metadata.urlOrigin!);
  }, [connectedIdentity?.metadata.urlOrigin]);

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
    isJoined,
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
