import Box from "@mui/material/Box";
import { Navigate, RouteObject, useRoutes } from "react-router-dom";

import { Paths } from "@src/constants";
import Bandada from "@src/pages/Bandada";
import Connect from "@src/pages/Connect";
import IdentityMetadata from "@src/pages/IdentityMetadata";
import ImportIdentity from "@src/pages/ImportIdentity";
import RateLimitingNullifier from "@src/pages/RateLimitingNullifier";
import RevealIdentity from "@src/pages/RevealIdentity";
import Semaphore from "@src/pages/Semaphore";
import Overview from "@src/pages/Overview";
import Contributing from "@src/pages/Contributing";
import Resources from "@src/pages/Resources";
import PrivacyPolicy from "@src/pages/PrivacyPolicy";
import FAQ from "@src/pages/FAQ";
import Terms from "@src/pages/Terms";
import Home from "@src/pages/Home";
import "@src/styles/style.css";

export const routeConfig: RouteObject[] = [
  { path: Paths.HOME, element: <Home /> },

  // GettingStarted
  { path: Paths.OVERVIEW, element: <Overview /> },
  { path: Paths.CONTRIBUTING, element: <Contributing /> },

  // DEMO
  { path: Paths.CONNECT, element: <Connect /> },
  { path: Paths.GET_IDENTITY_METADATA, element: <IdentityMetadata /> },
  { path: Paths.IMPORT_IDENTITY, element: <ImportIdentity /> },
  { path: Paths.REVEAL_IDENTITY_COMMITMENT, element: <RevealIdentity /> },
  { path: Paths.SEMAPHORE, element: <Semaphore /> },
  { path: Paths.RLN, element: <RateLimitingNullifier /> },
  { path: Paths.BANDADA, element: <Bandada /> },

  // References
  { path: Paths.TERMS, element: <Terms /> },
  { path: Paths.FAQ, element: <FAQ /> },
  { path: Paths.RESOURCES, element: <Resources /> },
  { path: Paths.PRIVACY_POLICY, element: <PrivacyPolicy /> },
  {
    path: "*",
    element: <Navigate to={Paths.HOME} />,
  },
];

export const Main = (): JSX.Element => {
  const routes = useRoutes(routeConfig);

  return <Box>{routes}</Box>;
};
