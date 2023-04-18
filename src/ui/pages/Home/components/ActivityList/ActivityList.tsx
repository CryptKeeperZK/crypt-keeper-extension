import classNames from "classnames";

import { Checkbox } from "@src/ui/components/Checkbox";
import { ConfirmDangerModal } from "@src/ui/components/ConfirmDangerModal";
import { Icon } from "@src/ui/components/Icon";

import "./activityListStyles.scss";
import { ActivityItem } from "./Item";
import { useActivityList } from "./useActivityList";

export const ActivityList = (): JSX.Element => {
  const {
    isLoading,
    isConfirmModalOpen,
    operations,
    settings,
    onConfirmModalShow,
    onDeleteAllHistory,
    onDeleteHistoryOperation,
    onEnableHistory,
  } = useActivityList();

  if (isLoading) {
    return <div className="flex flex-row items-center justify-center p-4">Loading...</div>;
  }

  if (operations.length === 0) {
    return <div className="flex flex-row items-center justify-center p-4">No records found</div>;
  }

  return (
    <>
      <div className="flex justify-end mb-3 mt-3 mr-2">
        <Checkbox
          checked={Boolean(settings?.isEnabled)}
          className="mr-2"
          id="enabledHistory"
          onChange={onEnableHistory}
        />

        <label className="text-sm" htmlFor="enabledHistory">
          Keep track history
        </label>
      </div>

      <div className="activity-content">
        {operations.map((operation) => (
          <ActivityItem key={operation.id} operation={operation} onDelete={onDeleteHistoryOperation} />
        ))}
      </div>

      <ConfirmDangerModal accept={onDeleteAllHistory} isOpenModal={isConfirmModalOpen} reject={onConfirmModalShow} />

      <div className="flex flex-row items-center justify-center p-4">
        <button
          className={classNames("flex flex-row items-center justify-center cursor-pointer text-gray-600")}
          data-testid="create-new-identity"
          type="button"
          onClick={onConfirmModalShow}
        >
          <Icon className="mr-2" fontAwesome="fas fa-trash" size={1} />

          <div>Clear history</div>
        </button>
      </div>
    </>
  );
};
