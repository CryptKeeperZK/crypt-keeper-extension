import { lazy } from "react";

export type { ISignVerifiablePresentationProps } from "./SignVerifiablePresentation";

export default lazy(() => import("./SignVerifiablePresentation"));
