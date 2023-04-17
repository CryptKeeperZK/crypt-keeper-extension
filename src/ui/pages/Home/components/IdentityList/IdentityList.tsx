import classNames from "classnames";
import { useCallback, useState } from "react";

import { ConfirmDangerModal } from "@src/ui/components/ConfirmDangerModal";
import { Icon } from "@src/ui/components/Icon";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  createIdentityRequest,
  deleteAllIdentities,
  deleteIdentity,
  setActiveIdentity,
  setIdentityName,
  useSelectedIdentity,
} from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";

import type { IdentityData } from "@src/types";

import "./identityListStyles.scss";
import { IdentityItem } from "./Item";

export interface IdentityListProps {
  identities: IdentityData[];
}

export const IdentityList = ({ identities }: IdentityListProps): JSX.Element => {
  const selected = useSelectedIdentity();
  const dispatch = useAppDispatch();
  const { address } = useWallet();
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const onConfirmModalShow = useCallback(() => {
    setConfirmModalOpen((value) => !value);
  }, [setConfirmModalOpen]);

  const onSelectIdentity = useCallback(
    (identityCommitment: string) => {
      dispatch(setActiveIdentity(identityCommitment));
    },
    [dispatch],
  );

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

  const onDeleteAllIdentities = useCallback(() => {
    dispatch(deleteAllIdentities()).then(() => onConfirmModalShow());
  }, [dispatch, onConfirmModalShow]);

  const onCreateIdentityRequest = useCallback(() => {
    if (address) {
      dispatch(createIdentityRequest());
    }
  }, [address, dispatch]);

  return (
    <>
      <div className="identities-content">
        {identities.map(({ commitment, metadata }) => (
          <IdentityItem
            key={commitment}
            commitment={commitment}
            metadata={metadata}
            selected={selected?.commitment}
            onDeleteIdentity={onDeleteIdentity}
            onSelectIdentity={onSelectIdentity}
            onUpdateIdentityName={onUpdateIdentityName}
          />
        ))}
      </div>

      <ConfirmDangerModal accept={onDeleteAllIdentities} isOpenModal={isConfirmModalOpen} reject={onConfirmModalShow} />

      <div className="flex flex-row items-center p-4">
        <button
          className={classNames(
            "flex flex-row items-center justify-center cursor-pointer text-gray-600",
            `create-identity-row__${address ? "active" : "not-active"}`,
          )}
          data-testid="create-new-identity"
          type="button"
          onClick={onCreateIdentityRequest}
        >
          <Icon className="mr-2" fontAwesome="fas fa-plus" size={1} />

          <div>Add Identity</div>
        </button>

        {identities.length > 0 && (
          <button
            className={classNames(
              "flex flex-row items-center justify-center cursor-pointer text-gray-600",
              `create-identity-row__${address ? "active" : "not-active"}`,
            )}
            data-testid="clear-all-identities"
            type="button"
            onClick={onConfirmModalShow}
          >
            <Icon className="mr-2" fontAwesome="fas fa-trash" size={1} />

            <div>Clear all identities</div>
          </button>
        )}
      </div>
    </>
  );
};
