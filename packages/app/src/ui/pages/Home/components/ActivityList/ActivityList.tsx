import get from "lodash/get";

import "./activityListStyles.scss";
import { ActivityItem } from "./Item";
import { useActivityList } from "./useActivityList";

export const ActivityList = (): JSX.Element => {
  const { isLoading, operations, connectedOrigins, onDeleteHistoryOperation } = useActivityList();

  if (isLoading) {
    return <div className="activity-container flex flex-row items-center justify-center p-4">Loading...</div>;
  }

  if (operations.length === 0) {
    return <div className="activity-container flex flex-row items-center justify-center p-4">No records found</div>;
  }

  return (
    <div className="activity-content activity-container">
      {operations.map((operation) => (
        <ActivityItem
          key={operation.id}
          operation={operation}
          urlOrigin={connectedOrigins[get(operation, "identity.commitment")!]}
          onDelete={onDeleteHistoryOperation}
        />
      ))}
    </div>
  );
};
