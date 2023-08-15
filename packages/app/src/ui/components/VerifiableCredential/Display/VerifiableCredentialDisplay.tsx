import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { CryptkeeperVerifiableCredential } from "@src/types";

import { useVerifiableCredentialDisplay } from "./useVerifiableCredentialDisplay";
import "./verifiableCredentialDisplayStyles.scss";

export interface VerifiableCredentialDisplayProps {
  cryptkeeperVerifiableCredential: CryptkeeperVerifiableCredential;
  onRenameVerifiableCredential: (name: string) => void;
}

export const VerifiableCredentialDisplay = ({
  cryptkeeperVerifiableCredential,
  onRenameVerifiableCredential,
}: VerifiableCredentialDisplayProps): JSX.Element => {
  const initialName = cryptkeeperVerifiableCredential.metadata.name;
  const { register, handleSubmit, handleToggleRenaming, isRenaming, name, onSubmit } = useVerifiableCredentialDisplay(
    initialName,
    onRenameVerifiableCredential,
  );

  const { verifiableCredential } = cryptkeeperVerifiableCredential;
  const issuerId =
    typeof verifiableCredential.issuer === "string" ? verifiableCredential.issuer : verifiableCredential.issuer.id;

  return (
    <div>
      {isRenaming ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register("name")}
            autoFocus
            id="verifiable-credential-display-rename-input"
            size="small"
            type="text"
            variant="outlined"
            onBlur={handleToggleRenaming}
          />

          <IconButton
            className="verifiable-credential-display__select-icon-button--selected mr-2"
            data-testid="verifiable-credential-display-submit-rename"
            size="medium"
            type="submit"
          >
            <CheckIcon className="verifiable-credential-display__select-icon--selected" fontSize="inherit" />
          </IconButton>
        </form>
      ) : (
        <div className="flex flex-row items-center text-lg font-semibold">
          <IconButton
            className="verifiable-credential-display__menu-icon-button"
            data-testid="verifiable-credential-display-toggle-rename"
            size="small"
            onClick={handleToggleRenaming}
          >
            <EditIcon className="verifiable-credential-display__menu-icon" fontSize="inherit" />
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
