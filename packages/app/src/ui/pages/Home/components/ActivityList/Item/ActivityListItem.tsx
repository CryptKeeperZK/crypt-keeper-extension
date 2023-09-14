import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@mui/material/Tooltip";
import { useCallback } from "react";

import { Operation, OperationType } from "@src/types";
import { Icon } from "@src/ui/components/Icon";
import { Menu } from "@src/ui/components/Menu";
import { ellipsify } from "@src/util/account";
import { redirectToNewTab } from "@src/util/browser";
import { formatDate } from "@src/util/date";
import { getBandadaGroupUrl } from "@src/util/groups";

import "./activityListItemStyles.scss";

export interface IActivityItemProps {
  operation: Operation;
  onDelete: (id: string) => void;
}

const OPERATIONS: Record<OperationType, string> = {
  [OperationType.CREATE_IDENTITY]: "Identity created",
  [OperationType.DELETE_IDENTITY]: "Identity removed",
  [OperationType.DELETE_ALL_IDENTITIES]: "All identities removed",
  [OperationType.DOWNLOAD_BACKUP]: "Backup download",
  [OperationType.UPLOAD_BACKUP]: "Backup upload",
  [OperationType.RESET_PASSWORD]: "Password reset",
  [OperationType.NEW_VERIFIABLE_CREDENTIAL]: "Verifiable credential added",
  [OperationType.RENAME_VERIFIABLE_CREDENTIAL]: "Verifiable credential renamed",
  [OperationType.DELETE_VERIFIABLE_CREDENTIAL]: "Verifiable credential deleted",
  [OperationType.DELETE_ALL_VERIFIABLE_CREDENTIALS]: "All verifiable credentials deleted",
  [OperationType.REJECT_VERIFIABLE_CREDENTIAL_REQUEST]: "Verifiable credential request rejected",
  [OperationType.NEW_VERIFIABLE_PRESENTATION]: "Verifiable presentation generated",
  [OperationType.REJECT_VERIFIABLE_PRESENTATION_REQUEST]: "Verifiable presentation request rejected",
  [OperationType.REVEAL_IDENTITY_COMMITMENT]: "Identity revealed",
  [OperationType.JOIN_GROUP]: "Joined group",
};

export const ActivityItem = ({ operation, onDelete }: IActivityItemProps): JSX.Element => {
  const metadata = operation.identity?.metadata;

  const handleDelete = useCallback(() => {
    onDelete(operation.id);
  }, [operation.id, onDelete]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(metadata!.host!);
  }, [metadata?.host]);

  const onGoToGroup = useCallback(() => {
    redirectToNewTab(getBandadaGroupUrl(operation.group!.id!));
  }, [operation.group?.id]);

  return (
    <div className="p-4 activity-row" data-testid={`activity-operation-${operation.id}`}>
      <div className="flex flex-col flex-grow">
        <div className="flex flex-row items-center text-lg font-semibold">
          {OPERATIONS[operation.type]}

          {metadata?.host && (
            <span className="text-xs py-1 px-2 ml-2 rounded-full bg-gray-500 text-gray-800">
              <Tooltip title={metadata.host}>
                <FontAwesomeIcon data-testid="host" icon="link" style={{ cursor: "pointer" }} onClick={onGoToHost} />
              </Tooltip>
            </span>
          )}

          {operation.group?.id && (
            <span className="text-xs py-1 px-2 ml-2 rounded-full bg-gray-500 text-gray-800">
              <Tooltip title={`Group: ${getBandadaGroupUrl(operation.group.id)}`}>
                <FontAwesomeIcon
                  data-testid="group"
                  icon="users-rays"
                  style={{ cursor: "pointer" }}
                  onClick={onGoToGroup}
                />
              </Tooltip>
            </span>
          )}
        </div>

        {operation.identity && (
          <div className="text-base text-gray-300">{ellipsify(operation.identity.commitment)}</div>
        )}

        <div className="text-sm text-gray-500">{formatDate(new Date(operation.createdAt))}</div>
      </div>

      <Menu className="flex user-menu" items={[{ label: "Delete", isDangerItem: true, onClick: handleDelete }]}>
        <Icon className="activity-row__menu-icon" fontAwesome="fas fa-ellipsis-h" />
      </Menu>
    </div>
  );
};
