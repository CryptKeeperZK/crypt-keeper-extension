import { VerifiableCredential } from "@cryptkeeperzk/types";
import { ChangeEvent, FormEvent, MouseEvent as ReactMouseEvent, useCallback, useState } from "react";

import { VerifiableCredentialMetadata } from "@src/types";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import { Menuable } from "@src/ui/components/Menuable";
import { ellipsify } from "@src/util/account";

import "./verifiableCredentialListItemStyles.scss";

export interface VerifiableCredentialItemProps {
  verifiableCredential: VerifiableCredential;
  metadata: VerifiableCredentialMetadata;
  onRenameVerifiableCredential: (verifiableCredentialHash: string, name: string) => Promise<void>;
  onDeleteVerifiableCredential: (verifiableCredentialHash: string) => Promise<void>;
}

export const VerifiableCredentialItem = ({
  verifiableCredential,
  metadata,
  onRenameVerifiableCredential,
  onDeleteVerifiableCredential,
}: VerifiableCredentialItemProps): JSX.Element => {
  const [name, setName] = useState(metadata.name);
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
      onRenameVerifiableCredential(metadata.hash, name).finally(() => {
        setIsRenaming(false);
      });
    },
    [metadata.hash, name, onRenameVerifiableCredential],
  );

  const handleDeleteVerifiableCredential = useCallback(() => {
    onDeleteVerifiableCredential(metadata.hash);
  }, [metadata.hash, onDeleteVerifiableCredential]);

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
          <form className="flex flex-row items-center text-lg font-semibold" onSubmit={handleUpdateName}>
            <Input
              autoFocus
              className="verifiable-credential-row__input-field"
              id="verifiableCredentialRename"
              label=""
              type="text"
              value={name}
              onBlur={handleToggleRenaming}
              onChange={handleChangeName}
            />

            <Icon
              className="verifiable-credential-row__select-icon--selected mr-2"
              data-testid={`verifiable-credential-rename-${metadata.hash}`}
              fontAwesome="fa-solid fa-check"
              size={1}
              onClick={handleUpdateName}
            />
          </form>
        ) : (
          <div className="flex flex-row items-center text-lg font-semibold">{`${metadata.name}`}</div>
        )}

        <div className="text-base text-gray-300">Credential hash: {ellipsify(metadata.hash)}</div>

        <div className="text-xs text-gray-500">Issuer: {ellipsify(issuer)}</div>
      </div>

      <Menuable className="flex user-menu" items={menuItems}>
        <Icon className="verifiable-credential-row__menu-icon" fontAwesome="fas fa-ellipsis-h" />
      </Menuable>
    </div>
  );
};
