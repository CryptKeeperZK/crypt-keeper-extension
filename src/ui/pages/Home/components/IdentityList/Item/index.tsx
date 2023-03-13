import classNames from "classnames";
import { ChangeEvent, FormEvent, MouseEvent as ReactMouseEvent, useCallback, useState } from "react";

import { IdentityMetadata } from "@src/types";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import { Menuable } from "@src/ui/components/Menuable";
import { ellipsify } from "@src/util/account";

import "./identityListItemStyles.scss";

export interface IdentityItemProps {
  commitment: string;
  selected: string;
  metadata: IdentityMetadata;
  onDeleteIdentity: (commitment: string) => Promise<void>;
  onSelectIdentity: (commitment: string) => void;
  onUpdateIdentityName: (commitment: string, name: string) => Promise<void>;
}

export const IdentityItem = ({
  commitment,
  selected,
  metadata,
  onDeleteIdentity,
  onSelectIdentity,
  onUpdateIdentityName,
}: IdentityItemProps): JSX.Element => {
  const [name, setName] = useState(metadata.name);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleDeleteIdentity = useCallback(() => {
    onDeleteIdentity(commitment);
  }, [commitment, onDeleteIdentity]);

  const handleSelectIdentity = useCallback(() => {
    onSelectIdentity(commitment);
  }, [commitment, onSelectIdentity]);

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
      onUpdateIdentityName(commitment, name).finally(() => {
        setIsRenaming(false);
      });
    },
    [commitment, name, onUpdateIdentityName],
  );

  return (
    <div key={commitment} className="p-4 identity-row">
      <Icon
        className={classNames("identity-row__select-icon", {
          "identity-row__select-icon--selected": selected === commitment,
        })}
        data-testid={`identity-select-${commitment}`}
        fontAwesome="fas fa-check"
        onClick={handleSelectIdentity}
      />

      <div className="flex flex-col flex-grow">
        {isRenaming ? (
          <form className="flex flex-row items-center text-lg font-semibold" onSubmit={handleUpdateName}>
            <Input
              autoFocus
              className="identity-row__input-field"
              type="text"
              value={name}
              onBlur={handleToggleRenaming}
              onChange={handleChangeName}
            />

            <Icon
              className="identity-row__select-icon--selected mr-2"
              data-testid={`identity-rename-${commitment}`}
              fontAwesome="fa-solid fa-check"
              size={1}
              onClick={handleUpdateName}
            />
          </form>
        ) : (
          <div className="flex flex-row items-center text-lg font-semibold">
            {`${metadata.name}`}

            <span className="text-xs py-1 px-2 ml-2 rounded-full bg-gray-500 text-gray-800">
              {metadata.web2Provider || "random"}
            </span>
          </div>
        )}

        <div className="text-base text-gray-500">{ellipsify(commitment)}</div>
      </div>

      <Menuable
        className="flex user-menu"
        items={[
          { label: "Rename", onClick: handleToggleRenaming },
          { label: "Delete", onClick: handleDeleteIdentity },
        ]}
      >
        <Icon className="identity-row__menu-icon" fontAwesome="fas fa-ellipsis-h" />
      </Menuable>
    </div>
  );
};
