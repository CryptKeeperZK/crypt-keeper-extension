import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { CryptkeeperVerifiableCredential } from "@src/types";

import { useVerifiableCredentialDisplay } from "./useVerifiableCredentialDisplay";

export interface VerifiableCredentialDisplayProps {
  cryptkeeperVerifiableCredential: CryptkeeperVerifiableCredential;
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

  return (
    <div>
      {isRenaming ? (
        <form onSubmit={onSubmit}>
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
        </form>
      ) : (
        <div className="flex flex-row items-center text-lg font-semibold">
          <IconButton data-testid="verifiable-credential-display-toggle-rename" size="small" onClick={onToggleRenaming}>
            <EditIcon color="primary" fontSize="inherit" />
          </IconButton>

          {`${name}`}
        </div>
      )}

      <Typography variant="body1">
        <u>Type:</u>

        {` ${verifiableCredential.type.join(", ")}`}
      </Typography>

      <Typography variant="body1">
        <u>Issuer:</u>

        {` ${issuerId}`}
      </Typography>

      <Typography variant="body1">
        <u>Issuance Date:</u>

        {` ${verifiableCredential.issuanceDate.toString()}`}
      </Typography>

      <Typography variant="body1">
        <u>Expiration Date:</u>

        {` ${verifiableCredential.expirationDate?.toString()}`}
      </Typography>

      <Typography variant="body1">
        <u>Credential Subject Id:</u>

        {` ${verifiableCredential.credentialSubject.id}`}
      </Typography>

      <Typography variant="body1">
        <u>Credential Subject Claims:</u>

        {` ${JSON.stringify(verifiableCredential.credentialSubject.claims)}`}
      </Typography>
    </div>
  );
};
