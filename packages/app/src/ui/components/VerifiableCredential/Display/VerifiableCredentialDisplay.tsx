import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { ICryptkeeperVerifiableCredential } from "@src/types";

import { useVerifiableCredentialDisplay } from "./useVerifiableCredentialDisplay";

export interface VerifiableCredentialDisplayProps {
  cryptkeeperVerifiableCredential: ICryptkeeperVerifiableCredential;
  onRenameVerifiableCredential: (name: string) => void;
}

export const VerifiableCredentialDisplay = ({
  cryptkeeperVerifiableCredential,
  onRenameVerifiableCredential,
}: VerifiableCredentialDisplayProps): JSX.Element => {
  const initialName = cryptkeeperVerifiableCredential.metadata.name;
  const { isRenaming, name, register, onSubmit, onToggleRenaming } = useVerifiableCredentialDisplay({
    initialName,
    onRename: onRenameVerifiableCredential,
  });

  const { verifiableCredential } = cryptkeeperVerifiableCredential;
  const issuerId =
    typeof verifiableCredential.issuer === "string" ? verifiableCredential.issuer : verifiableCredential.issuer.id;
  const expirationDate = verifiableCredential.expirationDate ? verifiableCredential.expirationDate.toString() : "N/A";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        m: 1,
        width: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        overflowWrap: "anywhere",
      }}
    >
      {isRenaming ? (
        <Box component="form" onSubmit={onSubmit}>
          <TextField
            {...register("name")}
            autoFocus
            data-testid="verifiable-credential-display-rename-input"
            id="verifiable-credential-display-rename-input"
            size="small"
            type="text"
            variant="outlined"
            onBlur={onToggleRenaming}
          />

          <IconButton data-testid="verifiable-credential-display-submit-rename" size="medium" type="submit">
            <CheckIcon color="primary" fontSize="inherit" />
          </IconButton>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            fontSize: "large",
            fontWeight: "semibold",
          }}
        >
          <IconButton data-testid="verifiable-credential-display-toggle-rename" size="small" onClick={onToggleRenaming}>
            <EditIcon color="primary" fontSize="inherit" />
          </IconButton>

          {name}
        </Box>
      )}

      <Box
        sx={{
          fontSize: "medium",
          mt: 1,
        }}
      >
        <Typography fontWeight="bold">Type:</Typography>

        <Typography sx={{ ml: 2 }}>{verifiableCredential.type.join(", ")}</Typography>
      </Box>

      <Box
        sx={{
          fontSize: "medium",
          mt: 1,
        }}
      >
        <Typography fontWeight="bold">Issuer:</Typography>

        <Typography sx={{ ml: 2 }}>{issuerId}</Typography>
      </Box>

      <Box
        sx={{
          fontSize: "medium",
          mt: 1,
        }}
      >
        <Typography fontWeight="bold">Issued Date:</Typography>

        <Typography sx={{ ml: 2 }}>{verifiableCredential.issuanceDate.toString()}</Typography>
      </Box>

      <Box
        sx={{
          fontSize: "medium",
          mt: 1,
        }}
      >
        <Typography fontWeight="bold">Expiration Date:</Typography>

        <Typography sx={{ ml: 2 }}>{expirationDate}</Typography>
      </Box>

      <Box
        sx={{
          fontSize: "medium",
          mt: 1,
        }}
      >
        <Typography fontWeight="bold">Credential Subject:</Typography>

        <Typography sx={{ ml: 2 }}>{verifiableCredential.credentialSubject.id}</Typography>
      </Box>

      <Box
        sx={{
          fontSize: "medium",
          mt: 1,
        }}
      >
        <Typography fontWeight="bold">Claims:</Typography>

        <Typography sx={{ ml: 2 }}>{JSON.stringify(verifiableCredential.credentialSubject.claims)}</Typography>
      </Box>
    </Box>
  );
};
