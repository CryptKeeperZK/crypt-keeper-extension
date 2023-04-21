import { lazy } from "react";

export * from "./General";

export default lazy(() => import("./General"));
