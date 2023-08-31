import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, revealConnectedIdentityCommitment, useConnectedIdentity } from "@src/ui/ducks/identities";
import { redirectToNewTab } from "@src/util/browser";

import type { IIdentityData } from "@cryptkeeperzk/types";

export interface IUseRevealIdentityCommitmentData {
  isLoading: boolean;
  error: string;
  connectedIdentity?: IIdentityData;
  onGoBack: () => void;
  onGoToHost: () => void;
  onReveal: () => void;
}

export const useRevealIdentityCommitment = (): IUseRevealIdentityCommitmentData => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const connectedIdentity = useConnectedIdentity();

  useEffect(() => {
    setLoading(true);
    dispatch(fetchIdentities())
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dispatch, setLoading, setError]);

  const onGoBack = useCallback(() => {
    dispatch(closePopup());
    navigate(Paths.HOME);
  }, [dispatch, navigate]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(connectedIdentity!.metadata.host!);
  }, [connectedIdentity?.metadata.host]);

  const onReveal = useCallback(() => {
    dispatch(revealConnectedIdentityCommitment())
      .then(() => dispatch(closePopup()))
      .then(() => navigate(Paths.HOME))
      .catch((err: Error) => setError(err.message));
  }, [dispatch, navigate, setError]);

  return {
    isLoading,
    error,
    connectedIdentity,
    onGoBack,
    onGoToHost,
    onReveal,
  };
};
