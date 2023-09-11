import { lazy } from "react";

export type { IVerifiableCredentialSelectorProps } from "./VerifiableCredentialSelector";

export default lazy(() => import("./VerifiableCredentialSelector"));
