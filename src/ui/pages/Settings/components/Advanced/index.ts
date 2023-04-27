import { lazy } from "react";

export * from "./Advanced";

export default lazy(() => import("./Advanced"));
