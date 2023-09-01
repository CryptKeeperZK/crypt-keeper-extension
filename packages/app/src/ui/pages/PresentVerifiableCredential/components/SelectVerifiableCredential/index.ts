import { lazy } from "react";

export type { ISelectVerifiableCredentialProps } from "./SelectVerifiableCredential";

export default lazy(() => import("./SelectVerifiableCredential"));
