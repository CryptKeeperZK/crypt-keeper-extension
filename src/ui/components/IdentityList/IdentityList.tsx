import Typography from "@mui/material/Typography";
import classNames from "classnames";
import { useCallback } from "react";

import { Icon } from "@src/ui/components/Icon";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentityRequest, deleteIdentity, setIdentityName } from "@src/ui/ducks/identities";

import type { IdentityData } from "@src/types";

import "./identityListStyles.scss";
import { IdentityItem } from "./Item";

export interface IdentityListProps {
  isShowAddNew: boolean;
  isShowMenu: boolean;
  identities: IdentityData[];
  selectedCommitment?: string;
  onSelect: (identityCommitment: string) => void;
}

export const IdentityList = ({
  isShowAddNew,
  isShowMenu,
  identities,
  selectedCommitment = undefined,
  onSelect: onSelectIdentity,
}: IdentityListProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const onUpdateIdentityName = useCallback(
    async (identityCommitment: string, name: string) => {
      await dispatch(setIdentityName(identityCommitment, name));
    },
    [dispatch],
  );

  const onDeleteIdentity = useCallback(
    async (identityCommitment: string) => {
      await dispatch(deleteIdentity(identityCommitment));
    },
    [dispatch],
  );

  const onCreateIdentityRequest = useCallback(() => {
    dispatch(createIdentityRequest({ host: "" }));
  }, [dispatch]);

  return (
    <>
      <div className="identities-content">
        {identities.map(({ commitment, metadata }) => (
          <IdentityItem
            key={commitment}
            commitment={commitment}
            isShowMenu={isShowMenu}
            metadata={metadata}
            selected={selectedCommitment}
            onDeleteIdentity={onDeleteIdentity}
            onSelectIdentity={onSelectIdentity}
            onUpdateIdentityName={onUpdateIdentityName}
          />
        ))}

        {identities.length === 0 && (
          <Typography sx={{ my: 2, textAlign: "center" }}>No identities available</Typography>
        )}
      </div>

      {isShowAddNew && (
        <div className="flex flex-row items-center p-4">
          <button
            className={classNames(
              "flex flex-row items-center justify-center cursor-pointer text-gray-600",
              "create-identity-row__active",
            )}
            data-testid="create-new-identity"
            type="button"
            onClick={onCreateIdentityRequest}
          >
            <Icon className="mr-2" fontAwesome="fas fa-plus" size={1} />

            <div>Add Identity</div>
          </button>
        </div>
      )}
    </>
  );
};
