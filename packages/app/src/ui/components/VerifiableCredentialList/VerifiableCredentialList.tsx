import { VerifiableCredential } from "@cryptkeeperzk/types";
import Typography from "@mui/material/Typography";

export interface VerifiableCredentialsListProps {
  verifiableCredentials: VerifiableCredential[];
}

export const VerifiableCredentialsList = ({ verifiableCredentials }: VerifiableCredentialsListProps): JSX.Element => {
  return (
    <>
      <div className="identities-content">
        {verifiableCredentials.map((credential) => (
          <div>
            <Typography>{credential.id}</Typography>
          </div>
        ))}

        {verifiableCredentials.length === 0 && (
          <Typography sx={{ my: 2, textAlign: "center" }}>No identities available</Typography>
        )}
      </div>
    </>
  );
};
