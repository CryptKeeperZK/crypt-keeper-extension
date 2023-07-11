import { lazy } from "react";

export type { IAdvancedProps } from "./Advanced";

export default lazy(() => import("./Advanced"));
