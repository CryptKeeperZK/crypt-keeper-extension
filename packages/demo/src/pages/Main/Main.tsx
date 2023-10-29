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
import VerifiableCredentials from "@src/pages/VerifiableCredentials";

const routeConfig: RouteObject[] = [
  { path: Paths.CONNECT, element: <Connect /> },
  { path: Paths.GET_IDENTITY_METADATA, element: <IdentityMetadata /> },
  { path: Paths.IMPORT_IDENTITY, element: <ImportIdentity /> },
  { path: Paths.REVEAL_IDENTITY_COMMITMENT, element: <RevealIdentity /> },
  { path: Paths.SEMAPHORE, element: <Semaphore /> },
  { path: Paths.RLN, element: <RateLimitingNullifier /> },
  { path: Paths.BANDADA, element: <Bandada /> },
  { path: Paths.VERIFIABLE_CREDENTIALS, element: <VerifiableCredentials /> },
  {
    path: "*",
    element: <Navigate to={Paths.GET_IDENTITY_METADATA} />,
  },
];

export const Main = (): JSX.Element => {
  const routes = useRoutes(routeConfig);

  return <Box>{routes}</Box>;
};
