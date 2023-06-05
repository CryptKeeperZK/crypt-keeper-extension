import { IdentityData } from "@src/types";

import "./identitiesContent.scss";
import { IdentityItem } from "./Item";

import {
  deleteIdentity,
  setActiveIdentity,
  setConnectedIdentity,
  setIdentityName,
  useSelectedIdentity,
} from "@src/ui/ducks/identities";

import { useCallback } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IdentityListProps {
  identities: IdentityData[];
  host?: string;
  isShowSettings: boolean;
  isDisableCheckClick: boolean;
}

export const IdentitiesContent = ({
  identities,
  host,
  isShowSettings,
  isDisableCheckClick,
}: IdentityListProps): JSX.Element => {
  const selected = useSelectedIdentity();
  const dispatch = useAppDispatch();

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
  return (
    <div className="identities-content">
      {identities.map(({ commitment, metadata }) => (
        <IdentityItem
          key={commitment}
          commitment={commitment}
          host={host}
          isDisableCheckClick={isDisableCheckClick}
          isShowSettings={isShowSettings}
          metadata={metadata}
          selected={selected?.commitment}
          onDeleteIdentity={onDeleteIdentity}
          onSelectIdentity={onSelectIdentity}
          onUpdateIdentityName={onUpdateIdentityName}
        />
      ))}
    </div>
  );
};
