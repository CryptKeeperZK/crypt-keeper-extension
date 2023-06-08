import { IconName, IconPrefix } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { ChangeEvent, FormEvent, MouseEvent as ReactMouseEvent, useCallback, useState } from "react";

import { getEnabledFeatures } from "@src/config/features";
import { IdentityMetadata, IdentityWeb2Provider } from "@src/types";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import { Menuable } from "@src/ui/components/Menuable";
import { ellipsify } from "@src/util/account";

import "./identityListItemStyles.scss";

type IconWeb2Providers = Record<IdentityWeb2Provider, [IconPrefix, IconName]>;

const web2ProvidersIcons: IconWeb2Providers = {
  twitter: ["fab", "twitter"],
  reddit: ["fab", "reddit"],
  github: ["fab", "github"],
};

export interface IdentityItemProps {
  commitment: string;
  metadata: IdentityMetadata;
  isShowMenu: boolean;
  selected?: string;
  onDeleteIdentity: (commitment: string) => Promise<void>;
  onSelectIdentity: (commitment: string) => void;
  onUpdateIdentityName: (commitment: string, name: string) => Promise<void>;
}

export const IdentityItem = ({
  commitment,
  isShowMenu,
  selected = "",
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

  const features = getEnabledFeatures();
  const identityTitle = features.INTERREP_IDENTITY ? "random" : "";
  const canShowIdentityType = Boolean(metadata.web2Provider || identityTitle);

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
              id="identityRename"
              label=""
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

            {canShowIdentityType && (
              <span className="text-xs py-1 px-2 ml-2 rounded-full bg-gray-500 text-gray-800">
                {metadata.web2Provider ? (
                  <FontAwesomeIcon icon={web2ProvidersIcons[metadata.web2Provider]} title={metadata.web2Provider} />
                ) : (
                  identityTitle
                )}
              </span>
            )}
          </div>
        )}

        <div className="text-base text-gray-300">Commitment: {ellipsify(commitment)}</div>

        {metadata.account && <div className="text-xs text-gray-500">Address: {ellipsify(metadata.account)}</div>}
      </div>

      {isShowMenu && (
        <Menuable
          className="flex user-menu"
          items={[
            { label: "Rename", isDangerItem: false, onClick: handleToggleRenaming },
            { label: "Delete", isDangerItem: true, onClick: handleDeleteIdentity },
          ]}
        >
          <Icon className="identity-row__menu-icon" fontAwesome="fas fa-ellipsis-h" />
        </Menuable>
      )}
    </div>
  );
};
