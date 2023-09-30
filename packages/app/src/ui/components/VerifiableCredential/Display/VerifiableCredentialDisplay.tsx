import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { ICryptkeeperVerifiableCredential } from "@src/types";

import { useVerifiableCredentialDisplay } from "./useVerifiableCredentialDisplay";

export interface VerifiableCredentialDisplayProps {
  cryptkeeperVC: ICryptkeeperVerifiableCredential;
  onRenameVC: (name: string) => void;
}

export const VerifiableCredentialDisplay = ({
  cryptkeeperVC,
  onRenameVC,
}: VerifiableCredentialDisplayProps): JSX.Element => {
  const initialName = cryptkeeperVC.metadata.name;
  const { isRenaming, name, register, onRename, onToggleRenaming } = useVerifiableCredentialDisplay({
    initialName,
    onRenameVC,
  });

  const { vc } = cryptkeeperVC;
  const issuerId = typeof vc.issuer === "string" ? vc.issuer : vc.issuer.id;
  const expirationDate = vc.expirationDate ? vc.expirationDate.toString() : "N/A";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        mt: 1,
        width: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        overflowWrap: "anywhere",
        scrollbarWidth: "none",

        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {isRenaming ? (
        <Box component="form" onSubmit={onRename}>
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

        <Typography sx={{ ml: 2 }}>{vc.type.join(", ")}</Typography>
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

        <Typography sx={{ ml: 2 }}>{vc.issuanceDate.toString()}</Typography>
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

        <Typography sx={{ ml: 2 }}>{vc.credentialSubject.id}</Typography>
      </Box>

      <Box
        sx={{
          fontSize: "medium",
          mt: 1,
        }}
      >
        <Typography fontWeight="bold">Claims:</Typography>

        <Typography sx={{ ml: 2 }}>{JSON.stringify(vc.credentialSubject.claims)}</Typography>
      </Box>
    </Box>
  );
};
