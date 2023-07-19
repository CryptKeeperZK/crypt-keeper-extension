import { lazy } from "react";

export type { IBackupProps } from "./Backup";

export default lazy(() => import("./Backup"));
