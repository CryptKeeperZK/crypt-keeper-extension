import log from "loglevel";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { fetchStatus, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchPendingRequests, usePendingRequests } from "@src/ui/ducks/requests";
import { useWallet } from "@src/ui/hooks/wallet";

export interface IUsePopupData {
  isLoading: boolean;
  isInitialized: boolean;
  isUnlocked: boolean;
  isShowRequestModal: boolean;
}

const REDIRECT_PATHS: Record<string, Paths> = {
  [Paths.CREATE_IDENTITY]: Paths.CREATE_IDENTITY,
};

export const usePopup = (): IUsePopupData => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { onConnectEagerly } = useWallet();
  const pendingRequests = usePendingRequests();
  const { isInitialized, isUnlocked } = useAppStatus();

  const url = new URL(window.location.href);
  const redirectParam = url.searchParams.get("redirect");
  const redirect = useMemo(() => redirectParam && REDIRECT_PATHS[redirectParam], [redirectParam, window.location.href]);

  const fetchData = useCallback(async () => {
    await Promise.all([dispatch(fetchStatus()), dispatch(fetchPendingRequests())]);
  }, [dispatch]);

  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .catch((error) => log.error(error))
      .finally(() => setIsLoading(false));
  }, [isUnlocked, fetchData, setIsLoading]);

  useEffect(() => {
    onConnectEagerly();
  }, [onConnectEagerly]);

  useEffect(() => {
    if (redirect) {
      url.searchParams.delete("redirect");
      window.history.replaceState(null, "", url);
      navigate(redirect);
    }
  }, [redirect, navigate]);

  return {
    isLoading,
    isInitialized,
    isUnlocked,
    isShowRequestModal: pendingRequests.length > 0,
  };
};
