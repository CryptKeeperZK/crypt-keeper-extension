import { lazy } from "react";

export type { ISecurityProps } from "./Security";

export default lazy(() => import("./Security"));
