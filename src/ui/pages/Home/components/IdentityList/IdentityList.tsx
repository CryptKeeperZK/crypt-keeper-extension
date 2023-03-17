import classNames from "classnames";
import { useCallback } from "react";

import { Icon } from "@src/ui/components/Icon";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  createIdentityRequest,
  deleteIdentity,
  setActiveIdentity,
  setIdentityName,
  useIdentities,
  useSelectedIdentity,
} from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";

import "./identityListStyles.scss";
import { IdentityItem } from "./Item";

export const IdentityList = (): JSX.Element => {
  const identities = useIdentities();
  const selected = useSelectedIdentity();
  const dispatch = useAppDispatch();
  const { address } = useWallet();

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

  const onCreateIdentityRequest = useCallback(() => {
    if (address) {
      dispatch(createIdentityRequest());
    }
  }, [address, dispatch]);

  return (
    <>
      {identities.map(({ commitment, metadata }) => (
        <IdentityItem
          key={commitment}
          commitment={commitment}
          metadata={metadata}
          selected={selected.commitment}
          onDeleteIdentity={onDeleteIdentity}
          onSelectIdentity={onSelectIdentity}
          onUpdateIdentityName={onUpdateIdentityName}
        />
      ))}

      <button
        className={classNames(
          "flex flex-row items-center justify-center p-4 cursor-pointer text-gray-600",
          `create-identity-row__${address ? "active" : "not-active"}`,
        )}
        data-testid="create-new-identity"
        type="button"
        onClick={onCreateIdentityRequest}
      >
        <Icon className="mr-2" fontAwesome="fas fa-plus" size={1} />

        <div>Add Identity</div>
      </button>
    </>
  );
};
