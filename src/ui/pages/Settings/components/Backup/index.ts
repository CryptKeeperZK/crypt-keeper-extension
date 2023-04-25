import { lazy } from "react";

export * from "./Backup";

export default lazy(() => import("./Backup"));
