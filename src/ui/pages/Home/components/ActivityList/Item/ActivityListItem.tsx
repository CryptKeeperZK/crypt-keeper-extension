import { IconName, IconPrefix } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";

import { IdentityWeb2Provider, Operation, OperationType } from "@src/types";
import { Icon } from "@src/ui/components/Icon";
import { Menuable } from "@src/ui/components/Menuable";
import { ellipsify } from "@src/util/account";
import { formatDate } from "@src/util/date";

import "./activityListItemStyles.scss";

export interface IActivityItemProps {
  operation: Operation;
  onDelete: (id: string) => void;
}

type IconWeb2Providers = Record<IdentityWeb2Provider, [IconPrefix, IconName]>;

const OPERATIONS: Record<OperationType, string> = {
  [OperationType.CREATE_IDENTITY]: "Identity created",
  [OperationType.DELETE_IDENTITY]: "Idendity removed",
  [OperationType.DELETE_ALL_IDENTITIES]: "All identities removed",
};

const web2ProvidersIcons: IconWeb2Providers = {
  twitter: ["fab", "twitter"],
  reddit: ["fab", "reddit"],
  github: ["fab", "github"],
};

export const ActivityItem = ({ operation, onDelete }: IActivityItemProps): JSX.Element => {
  const metadata = operation.identity?.metadata;

  const handleDelete = useCallback(() => {
    onDelete(operation.id);
  }, [operation.id, onDelete]);

  return (
    <div className="p-4 activity-row" data-testid={`activity-operation-${operation.id}`}>
      <div className="flex flex-col flex-grow">
        <div className="flex flex-row items-center text-lg font-semibold">
          {OPERATIONS[operation.type]}

          {metadata && (
            <span className="text-xs py-1 px-2 ml-2 rounded-full bg-gray-500 text-gray-800">
              {metadata.web2Provider ? (
                <FontAwesomeIcon icon={web2ProvidersIcons[metadata.web2Provider]} title={metadata.web2Provider} />
              ) : (
                "random"
              )}
            </span>
          )}
        </div>

        {operation.identity && (
          <div className="text-base text-gray-300">{ellipsify(operation.identity.commitment)}</div>
        )}

        <div className="text-sm text-gray-500">{formatDate(new Date(operation.createdAt))}</div>
      </div>

      <Menuable className="flex user-menu" items={[{ label: "Delete", isDangerItem: true, onClick: handleDelete }]}>
        <Icon className="activity-row__menu-icon" fontAwesome="fas fa-ellipsis-h" />
      </Menuable>
    </div>
  );
};
