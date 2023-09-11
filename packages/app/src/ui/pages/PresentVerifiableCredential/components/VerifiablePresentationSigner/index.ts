import { lazy } from "react";

export type { IVerifiablePresentationSignerProps } from "./VerifiablePresentationSigner";

export default lazy(() => import("./VerifiablePresentationSigner"));
