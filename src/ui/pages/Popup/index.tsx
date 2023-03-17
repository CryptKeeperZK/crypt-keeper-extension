import log from "loglevel";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { ConfirmRequestModal } from "@src/ui/components/ConfirmRequestModal";
import { fetchStatus, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useRequestsPending, fetchRequestPendingStatus } from "@src/ui/ducks/requests";
import { useWallet } from "@src/ui/hooks/wallet";
import { CreateIdentity } from "@src/ui/pages/CreateIdentity";
import { Home } from "@src/ui/pages/Home";
import Login from "@src/ui/pages/Login";
import Onboarding from "@src/ui/pages/Onboarding";

import "./popup.scss";

const REDIRECT_PATHS: Record<string, Paths> = {
  [Paths.CREATE_IDENTITY]: Paths.CREATE_IDENTITY,
};

const Popup = (): JSX.Element | null => {
  const pendingRequests = useRequestsPending();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const { initialized, unlocked } = useAppStatus();
  const { onConnectEagerly } = useWallet();
  const navigate = useNavigate();
  const url = new URL(window.location.href);

  const fetchData = useCallback(async () => {
    await Promise.all([dispatch(fetchStatus()), dispatch(fetchRequestPendingStatus())]);
  }, [dispatch]);

  useEffect(() => {
    onConnectEagerly();
  }, [onConnectEagerly]);

  useEffect(() => {
    const redirectParam = url.searchParams.get("redirect");
    const redirect = redirectParam && REDIRECT_PATHS[redirectParam];

    if (redirect) {
      url.searchParams.delete("redirect");
      window.history.replaceState(null, "", url);
      navigate(redirect);
    }
  }, [url, navigate, window.history]);

  useEffect(() => {
    fetchData()
      .catch((error) => log.error(error))
      .finally(() => setLoading(false));
  }, [fetchData, setLoading, unlocked]);

  if (loading) {
    return null;
  }

  let content: ReactNode;

  if (!initialized) {
    content = <Onboarding />;
  } else if (!unlocked) {
    content = <Login />;
  } else if (pendingRequests.length) {
    return <ConfirmRequestModal />;
  } else {
    content = (
      <Routes>
        <Route element={<Home />} path={Paths.HOME} />

        <Route element={<CreateIdentity />} path={Paths.CREATE_IDENTITY} />

        <Route element={<Navigate replace to={Paths.HOME} />} />
      </Routes>
    );
  }

  return <div className="popup">{content}</div>;
};

export default Popup;
