import { Navigate, RouteObject, useRoutes } from "react-router-dom";

import { Paths } from "@src/constants";
import ConfirmRequestModal from "@src/ui/components/ConfirmRequestModal";
import ConnectIdentity from "@src/ui/pages/ConnectIdentity";
import CreateIdentity from "@src/ui/pages/CreateIdentity";
import DownloadBackup from "@src/ui/pages/DownloadBackup";
import Home from "@src/ui/pages/Home";
import Login from "@src/ui/pages/Login";
import Mnemonic from "@src/ui/pages/Mnemonic";
import Onboarding from "@src/ui/pages/Onboarding";
import Recover from "@src/ui/pages/Recover";
import Settings from "@src/ui/pages/Settings";

import "../../styles.scss";

import { usePopup } from "./usePopup";

const routeConfig: RouteObject[] = [
  { path: Paths.HOME, element: <Home /> },
  { path: Paths.CREATE_IDENTITY, element: <CreateIdentity /> },
  { path: Paths.LOGIN, element: <Login /> },
  { path: Paths.ONBOARDING, element: <Onboarding /> },
  { path: Paths.REQUESTS, element: <ConfirmRequestModal /> },
  { path: Paths.SETTINGS, element: <Settings /> },
  { path: Paths.DOWNLOAD_BACKUP, element: <DownloadBackup /> },
  { path: Paths.MNEMONIC, element: <Mnemonic /> },
  { path: Paths.CONNECT_IDENTITY, element: <ConnectIdentity /> },
  { path: Paths.RECOVER, element: <Recover /> },
  {
    path: "*",
    element: <Navigate to={Paths.HOME} />,
  },
];

const Popup = (): JSX.Element | null => {
  const routes = useRoutes(routeConfig);
  const { isLoading } = usePopup();

  if (isLoading) {
    return null;
  }

  return <div className="popup">{routes}</div>;
};

export default Popup;
