import { EventName } from "@cryptkeeperzk/providers";
import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { checkGroupMembership, generateGroupMerkleProof } from "@src/ui/ducks/groups";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, useConnectedIdentity } from "@src/ui/ducks/identities";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useUrlParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";
import { getBandadaGroupUrl } from "@src/util/groups";

import type { IIdentityData } from "@cryptkeeperzk/types";

export interface IUseGroupMerkleProofData {
  isLoading: boolean;
  isSubmitting: boolean;
  isJoined: boolean;
  error: string;
  faviconUrl: string;
  groupId?: string;
  connectedIdentity?: IIdentityData;
  onGoBack: () => void;
  onGoToHost: () => void;
  onGoToGroup: () => void;
  onGenerateMerkleProof: () => void;
}

export const useGroupMerkleProof = (): IUseGroupMerkleProofData => {
  const [isLoading, setLoading] = useState(false);
  const [isJoined, setJoined] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const groupId = useUrlParam("id");

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
    dispatch(
      rejectUserRequest({ type: EventName.GROUP_MERKLE_PROOF, payload: { groupId } }, connectedIdentity?.metadata.host),
    )
      .then(() => dispatch(closePopup()))
      .then(() => {
        navigate(Paths.HOME);
      });
  }, [groupId, connectedIdentity?.metadata.host, dispatch, navigate]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(connectedIdentity!.metadata.host!);
  }, [connectedIdentity?.metadata.host]);

  const onGoToGroup = useCallback(() => {
    redirectToNewTab(getBandadaGroupUrl(groupId!));
  }, [groupId]);

  const onGenerateMerkleProof = useCallback(() => {
    setSubmitting(true);
    dispatch(generateGroupMerkleProof({ groupId: groupId! }))
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
  }, [groupId, dispatch, navigate, setError, setSubmitting]);

  return {
    isLoading,
    isSubmitting,
    isJoined,
    error,
    faviconUrl,
    connectedIdentity,
    groupId,
    onGoBack,
    onGoToHost,
    onGoToGroup,
    onGenerateMerkleProof,
  };
};
