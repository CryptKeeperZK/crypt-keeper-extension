import { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Paths } from "@src/constants";
import ConfirmRequestModal from "@src/ui/components/ConfirmRequestModal";
import CreateIdentity from "@src/ui/pages/CreateIdentity";
import Home from "@src/ui/pages/Home";
import Login from "@src/ui/pages/Login";
import Onboarding from "@src/ui/pages/Onboarding";

import "./popup.scss";
import { usePopup } from "./usePopup";

export const Popup = (): JSX.Element | null => {
  const { isLoading, isInitialized, isUnlocked, isShowRequestModal } = usePopup();

  if (isLoading) {
    return null;
  }

  let content: ReactNode;

  if (!isInitialized) {
    content = <Onboarding />;
  } else if (!isUnlocked) {
    content = <Login />;
  } else if (isShowRequestModal) {
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
