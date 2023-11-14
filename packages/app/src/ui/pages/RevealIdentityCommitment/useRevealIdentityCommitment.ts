import { EventName } from "@cryptkeeperzk/providers";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { fetchConnections, revealConnectedIdentityCommitment, useConnection } from "@src/ui/ducks/connections";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities } from "@src/ui/ducks/identities";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";

import type { IIdentityConnection } from "@cryptkeeperzk/types";

export interface IUseRevealIdentityCommitmentData {
  isLoading: boolean;
  error: string;
  connection?: IIdentityConnection;
  onGoBack: () => void;
  onGoToHost: () => void;
  onReveal: () => void;
}

export const useRevealIdentityCommitment = (): IUseRevealIdentityCommitmentData => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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

  const onGoBack = useCallback(() => {
    dispatch(rejectUserRequest({ type: EventName.REVEAL_COMMITMENT }, connection?.urlOrigin))
      .then(() => dispatch(closePopup()))
      .then(() => {
        navigate(Paths.HOME);
      });
  }, [connection?.urlOrigin, dispatch, navigate]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(connection.urlOrigin);
  }, [connection?.urlOrigin]);

  const onReveal = useCallback(() => {
    dispatch(revealConnectedIdentityCommitment(connection.urlOrigin))
      .then(() => dispatch(closePopup()))
      .then(() => {
        navigate(Paths.HOME);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, [connection?.urlOrigin, dispatch, navigate, setError]);

  return {
    isLoading,
    error,
    connection,
    onGoBack,
    onGoToHost,
    onReveal,
  };
};
