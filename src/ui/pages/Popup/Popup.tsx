import { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Paths } from "@src/constants";
import { ConfirmRequestModal } from "@src/ui/components/ConfirmRequestModal";
import { CreateIdentity } from "@src/ui/pages/CreateIdentity";
import { Home } from "@src/ui/pages/Home";
import { Login } from "@src/ui/pages/Login";
import { Onboarding } from "@src/ui/pages/Onboarding";

import "./popup.scss";
import { usePopup } from "./usePopup";

export const Popup = (): JSX.Element | null => {
  const { isLoading, initialized, unlocked, pendingRequests } = usePopup();

  if (isLoading) {
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
