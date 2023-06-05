import { IdentityData, RequestResolutionAction, RequestResolutionStatus } from "@src/types";

import "./identitiesContent.scss";
import { IdentityItem } from "./Item";
import { deleteIdentity, setActiveIdentity, setConnectedIdentity, setIdentityName, useSelectedIdentity } from "@src/ui/ducks/identities";
import { useCallback } from "react";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { finalizeRequest, usePendingRequests } from "@src/ui/ducks/requests";

export interface IdentityListProps {
  identities: IdentityData[];
  host?: string;
  isShowSettings: boolean;
  isDisableCheckClick: boolean;
  accept?: (data?: unknown) => void;
}

export const IdentitiesContent = ({ identities, host, isShowSettings, isDisableCheckClick, accept }: IdentityListProps): JSX.Element => {
  const selected = useSelectedIdentity();
  const dispatch = useAppDispatch();

  const onSelectIdentity = useCallback(
    (identityCommitment: string) => {
      dispatch(setActiveIdentity(identityCommitment));
    },
    [dispatch],
  );


  const onConenctIdentity = useCallback(
    async (identityCommitment: string, host: string) => {
        if (!accept) {
            throw new Error("Please set accept to be able to continue")
        }
        await dispatch(setConnectedIdentity(identityCommitment, host));
        accept();
    },
    [accept],
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
          isShowSettings={isShowSettings}
          isDisableCheckClick={isDisableCheckClick}
          key={commitment}
          host={host}
          commitment={commitment}
          metadata={metadata}
          selected={selected?.commitment}
          onDeleteIdentity={onDeleteIdentity}
          onSelectIdentity={onSelectIdentity}
          onConenctIdentity={onConenctIdentity}
          onUpdateIdentityName={onUpdateIdentityName}
        />
      ))}
    </div>
  );
};
