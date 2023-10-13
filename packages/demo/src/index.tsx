import dotenv from "dotenv";
import { createRoot } from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";

import path from "path";

import { Main } from "./pages/Main/Main";

dotenv.config({ path: path.resolve(__dirname, "../..", ".env"), override: true });

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(<Main />);
