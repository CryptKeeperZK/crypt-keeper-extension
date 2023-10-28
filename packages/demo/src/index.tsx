import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import dotenv from "dotenv";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

import path from "path";

import Main from "@src/pages/Main";
import { theme } from "@src/styles";
import { CryptKeeperClientProvider } from "@src/context/CryptKeeperClientProvider";

//dotenv.config({ path: path.resolve(__dirname, "../..", ".env"), override: true });

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <HashRouter>
    <CryptKeeperClientProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Main />
      </ThemeProvider>
    </CryptKeeperClientProvider>
  </HashRouter>,
);
