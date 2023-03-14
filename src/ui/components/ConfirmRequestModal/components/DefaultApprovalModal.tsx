import { PendingRequest } from "@src/types";
import Button, { ButtonType } from "../../Button";
import FullModal, { FullModalHeader, FullModalContent, FullModalFooter } from "../../FullModal";

export function DefaultApprovalModal(props: {
  len: number;
  reject: () => void;
  accept: () => void;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest<string>;
}) {
  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Unhandled Request
        {props.len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${props.len}`}</div>}
      </FullModalHeader>
      <FullModalContent className="flex flex-col">
        <div className="text-sm font-semibold mb-2 break-all">{JSON.stringify(props.pendingRequest)}</div>
      </FullModalContent>
      {props.error && <div className="text-xs text-red-500 text-center pb-1">{props.error}</div>}
      <FullModalFooter>
        <Button btnType={ButtonType.secondary} onClick={props.reject} loading={props.loading}>
          Reject
        </Button>
        <Button className="ml-2" onClick={props.accept} loading={props.loading} disabled>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
