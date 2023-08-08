import { Typography } from "@mui/material";
import { ChangeEvent, FormEvent, MouseEvent as ReactMouseEvent, useCallback, useState } from "react";

import { CryptkeeperVerifiableCredential } from "@src/types";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";

import "./verifiableCredentialDisplayStyles.scss";

export interface VerifiableCredentialDisplayProps {
  cryptkeeperVerifiableCredential: CryptkeeperVerifiableCredential;
  onRenameVerifiableCredential: (newVerifiableCredentialName: string) => void;
}

export const VerifiableCredentialDisplay = ({
  cryptkeeperVerifiableCredential,
  onRenameVerifiableCredential,
}: VerifiableCredentialDisplayProps): JSX.Element => {
  const [name, setName] = useState(cryptkeeperVerifiableCredential.metadata.name);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleChangeName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    [setName],
  );

  const handleToggleRenaming = useCallback(() => {
    setIsRenaming((value) => !value);
  }, [setIsRenaming]);

  const handleUpdateName = useCallback(
    (event: FormEvent | ReactMouseEvent) => {
      event.preventDefault();
      onRenameVerifiableCredential(name);
      setIsRenaming(false);
    },
    [name, onRenameVerifiableCredential],
  );

  const { verifiableCredential } = cryptkeeperVerifiableCredential;
  const issuerId =
    typeof verifiableCredential.issuer === "string" ? verifiableCredential.issuer : verifiableCredential.issuer.id;

  return (
    <div>
      {isRenaming ? (
        <form className="flex flex-row items-center text-lg font-semibold" onSubmit={handleUpdateName}>
          <Input
            autoFocus
            className="verifiable-credential-display__input-field"
            id="verifiable-credential-display-rename-input"
            label=""
            type="text"
            value={name}
            onBlur={handleToggleRenaming}
            onChange={handleChangeName}
          />

          <Icon
            className="verifiable-credential-display__select-icon--selected mr-2"
            data-testid="verifiable-credential-display-submit-rename"
            fontAwesome="fa-solid fa-check"
            size={1}
            onClick={handleUpdateName}
          />
        </form>
      ) : (
        <div className="flex flex-row items-center text-lg font-semibold">
          <Icon
            className="verifiable-credential-display__menu-icon"
            data-testid="verifiable-credential-display-toggle-rename"
            fontAwesome="fa-solid fa-pencil-alt"
            size={1}
            onClick={handleToggleRenaming}
          />

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
