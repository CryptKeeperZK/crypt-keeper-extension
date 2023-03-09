import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import "./popup.scss";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "@src/ui/pages/Home";
import { useRequestsPending, fetchRequestPendingStatus } from "@src/ui/ducks/requests";
import { fetchStatus, useAppStatus } from "@src/ui/ducks/app";
import Onboarding from "@src/ui/pages/Onboarding";
import Login from "@src/ui/pages/Login";
import ConfirmRequestModal from "@src/ui/components/ConfirmRequestModal";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import log from "loglevel";

export default function Popup(): ReactElement {
  const pendingRequests = useRequestsPending();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const { initialized, unlocked } = useAppStatus();

  useEffect(() => {
    (async () => {
      try {
        await dispatch(fetchStatus());
        await dispatch(fetchRequestPendingStatus());
      } catch (e) {
        log.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    dispatch(fetchStatus());
    dispatch(fetchRequestPendingStatus());
  }, [unlocked]);

  if (loading) {
    return <></>;
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
        <Route path="/" element={<Home />} />
        <Route element={<Navigate replace to="/" />} />
      </Routes>
    );
  }

  return <div className="popup">{content}</div>;
}
