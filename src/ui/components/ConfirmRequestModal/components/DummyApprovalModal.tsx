import { PendingRequest } from "@src/types";
import Button, { ButtonType } from "../../Button";
import FullModal, { FullModalContent, FullModalFooter, FullModalHeader } from "../../FullModal";

export function DummyApprovalModal(props: {
  len: number;
  reject: () => void;
  accept: () => void;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest<string>;
}) {
  const { payload } = props.pendingRequest;

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Dummy Request
        {props.len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${props.len}`}</div>}
      </FullModalHeader>
      <FullModalContent className="flex flex-col">
        <div className="text-sm font-semibold mb-2">{payload}</div>
      </FullModalContent>
      {props.error && <div className="text-xs text-red-500 text-center pb-1">{props.error}</div>}
      <FullModalFooter>
        <Button btnType={ButtonType.secondary} onClick={props.reject} loading={props.loading}>
          Reject
        </Button>
        <Button className="ml-2" onClick={props.accept} loading={props.loading}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
