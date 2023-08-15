import { VerifiableCredential } from "@cryptkeeperzk/types";
import CheckIcon from "@mui/icons-material/Check";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { VerifiableCredentialMetadata } from "@src/types";
import { Menuable } from "@src/ui/components/Menuable";
import { ellipsify } from "@src/util/account";

import { useVerifiableCredentialItem } from "./useVerifiableCredentialItem";
import "./verifiableCredentialListItemStyles.scss";

export interface VerifiableCredentialItemProps {
  verifiableCredential: VerifiableCredential;
  metadata: VerifiableCredentialMetadata;
  onRenameVerifiableCredential: (hash: string, name: string) => Promise<void>;
  onDeleteVerifiableCredential: (hash: string) => Promise<void>;
}

export const VerifiableCredentialItem = ({
  verifiableCredential,
  metadata,
  onRenameVerifiableCredential,
  onDeleteVerifiableCredential,
}: VerifiableCredentialItemProps): JSX.Element => {
  const { register, handleSubmit, handleToggleRenaming, onSubmit, isRenaming, handleDeleteVerifiableCredential } =
    useVerifiableCredentialItem(
      metadata.name,
      metadata.hash,
      onRenameVerifiableCredential,
      onDeleteVerifiableCredential,
    );

  const menuItems = [
    { label: "Rename", isDangerItem: false, onClick: handleToggleRenaming },
    { label: "Delete", isDangerItem: true, onClick: handleDeleteVerifiableCredential },
  ];

  const issuer =
    typeof verifiableCredential.issuer === "string"
      ? verifiableCredential.issuer
      : verifiableCredential.issuer?.id || "unknown";

  return (
    <div key={metadata.hash} className="p-4 verifiable-credential-row">
      <div className="flex flex-col flex-grow">
        {isRenaming ? (
          <form className="flex flex-row items-center text-lg font-semibold" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register("name")}
              autoFocus
              className="verifiable-credential-row__input-field"
              id="verifiable-credential-row-rename-input"
              size="small"
              type="text"
              variant="outlined"
              onBlur={handleToggleRenaming}
            />

            <IconButton
              className="verifiable-credential-row__select-icon--selected mr-2"
              data-testid="verifiable-credential-row-submit-rename"
              size="medium"
              type="submit"
            >
              <CheckIcon className="verifiable-credential-row__select-icon--selected" fontSize="inherit" />
            </IconButton>
          </form>
        ) : (
          <Typography className="flex flex-row items-center text-lg font-semibold">{`${metadata.name}`}</Typography>
        )}

        <Typography className="text-base text-gray-300">Credential hash: {ellipsify(metadata.hash)}</Typography>

        <Typography className="text-xs text-gray-500">Issuer: {ellipsify(issuer)}</Typography>
      </div>

      <Menuable className="flex user-menu" items={menuItems}>
        <IconButton
          className="verifiable-credential-row__menu-icon-button"
          data-testid="verifiable-credential-row__menu-icon"
          size="small"
        >
          <MoreHorizIcon className="verifiable-credential-row__menu-icon" fontSize="inherit" />
        </IconButton>
      </Menuable>
    </div>
  );
};
