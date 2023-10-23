import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";

import { ActionBox } from "../ActionBox/ActionBox";

interface IImportIdentityProps {
  importIdentity: () => Promise<void>;
}

const IMPORT_IDENTITY = `import { initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const importIdentity = async () => {
  await client?.request({
    method: RPCExternalAction.IMPORT_IDENTITY,
    payload: {
      trapdoor,
      nullifier,
    },
  });
}`;

export const ImportIdentity = ({ importIdentity }: IImportIdentityProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
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
        code={IMPORT_IDENTITY}
        option={undefined}
        testId="import-identity"
        title="Import identity"
        onClick={importIdentity}
      />
    </Box>
  );
};
