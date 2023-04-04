import { Navigate, RouteObject, useRoutes } from "react-router-dom";

import { Paths } from "@src/constants";
import ConfirmRequestModal from "@src/ui/components/ConfirmRequestModal";
import CreateIdentity from "@src/ui/pages/CreateIdentity";
import Home from "@src/ui/pages/Home";
import Login from "@src/ui/pages/Login";
import Onboarding from "@src/ui/pages/Onboarding";

import "./popup.scss";
import { usePopup } from "./usePopup";

const routeConfig: RouteObject[] = [
  { path: Paths.ROOT, element: null },
  { path: Paths.HOME, element: <Home /> },
  { path: Paths.CREATE_IDENTITY, element: <CreateIdentity /> },
  { path: Paths.LOGIN, element: <Login /> },
  { path: Paths.ONBOARDING, element: <Onboarding /> },
  { path: Paths.REQUESTS, element: <ConfirmRequestModal /> },
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
