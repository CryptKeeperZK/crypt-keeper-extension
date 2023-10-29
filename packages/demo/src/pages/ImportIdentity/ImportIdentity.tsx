import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import Header from "@src/components/Header";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { useImportIdentity } from "./useImportIdentitiy";

export const ImportIdentity = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { importIdentity } = useImportIdentity();

  const { fileContent: code } = useFileReader("importIdentity.ts");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <Header />

      {/* Center Content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        <Container sx={{ flex: 1, position: "relative", top: 64 }}>
          <Box
            className={classes.popup}
            component="form"
            sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          >
            <Typography variant="h6">Import identity</Typography>

            <Typography component="div" fontWeight="bold" sx={{ textAlign: "left", mb: 3 }} variant="h6">
              Import identity with trapdoor and nullifier
            </Typography>

            <TextField id="trapdoor" label="Trapdoor" variant="filled" />

            <TextField id="nullifier" label="Nullifier" variant="filled" />

            <ActionBox<undefined, void>
              code={code}
              option={undefined}
              testId="import-identity"
              title="Import identity"
              onClick={importIdentity}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ImportIdentity;
