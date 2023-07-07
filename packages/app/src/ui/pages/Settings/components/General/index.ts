import { lazy } from "react";

export type { IGeneralProps } from "./General";

export default lazy(() => import("./General"));
