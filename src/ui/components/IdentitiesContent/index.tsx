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

import { useCallback, useEffect, useState } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { getLastActiveTabUrl } from "@src/util/browser";

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
  const [identitySelectedFromList, setIdentitySelectedFromList] = useState<string>("0"); // For UI bug: fixing the multiple selections

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

  const handleSelection = useCallback(
    (commitment: string) => {
      setIdentitySelectedFromList(commitment);
    },
    [setIdentitySelectedFromList],
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
          identitySelectedFromList={identitySelectedFromList}
          handleSelection={handleSelection}
          onDeleteIdentity={onDeleteIdentity}
          onSelectIdentity={onSelectIdentity}
          onUpdateIdentityName={onUpdateIdentityName}
        />
      ))}
    </div>
  );
};
