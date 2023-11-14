import { EventName } from "@cryptkeeperzk/providers";
import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { fetchConnections, useConnection } from "@src/ui/ducks/connections";
import { checkGroupMembership, generateGroupMerkleProof } from "@src/ui/ducks/groups";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities } from "@src/ui/ducks/identities";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";
import { getBandadaGroupUrl } from "@src/util/groups";

import type { IIdentityConnection } from "@cryptkeeperzk/types";

export interface IUseGroupMerkleProofData {
  isLoading: boolean;
  isSubmitting: boolean;
  isJoined: boolean;
  error: string;
  faviconUrl: string;
  groupId?: string;
  connection?: IIdentityConnection;
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

  const groupId = useSearchParam("groupId");
  const urlOrigin = useSearchParam("urlOrigin");

  const connection = useConnection(urlOrigin);

  useEffect(() => {
    setLoading(true);
    Promise.all([dispatch(fetchIdentities()), dispatch(fetchConnections())])
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, setLoading, setError]);

  useEffect(() => {
    if (!connection?.urlOrigin) {
      return;
    }

    setLoading(true);
    dispatch(checkGroupMembership({ groupId: groupId! }, connection.urlOrigin))
      .then((isJoinedToGroup) => {
        setJoined(isJoinedToGroup);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    getLinkPreview(connection.urlOrigin)
      .then((data) => {
        setFaviconUrl(data.favicons[0]);
      })
      .catch(() => {
        setFaviconUrl("");
      });
  }, [groupId, connection?.urlOrigin, setJoined, setError, setLoading, dispatch, setFaviconUrl]);

  const onGoBack = useCallback(() => {
    dispatch(rejectUserRequest({ type: EventName.GROUP_MERKLE_PROOF, payload: { groupId } }, connection?.urlOrigin))
      .then(() => dispatch(closePopup()))
      .then(() => {
        navigate(Paths.HOME);
      });
  }, [groupId, connection?.urlOrigin, dispatch, navigate]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(connection.urlOrigin);
  }, [connection?.urlOrigin]);

  const onGoToGroup = useCallback(() => {
    redirectToNewTab(getBandadaGroupUrl(groupId!));
  }, [groupId]);

  const onGenerateMerkleProof = useCallback(() => {
    setSubmitting(true);
    dispatch(generateGroupMerkleProof({ groupId: groupId! }, connection.urlOrigin))
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
  }, [groupId, connection?.urlOrigin, dispatch, navigate, setError, setSubmitting]);

  return {
    isLoading,
    isSubmitting,
    isJoined,
    error,
    faviconUrl,
    connection,
    groupId,
    onGoBack,
    onGoToHost,
    onGoToGroup,
    onGenerateMerkleProof,
  };
};
