import { PendingRequest, ZKProofPayload } from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";

import "../../confirmModal.scss";

import { useExportModal } from "./useExportModal";

export interface ExportModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest<ZKProofPayload>;
  accept: () => void;
  reject: () => void;
}

export const ExportModal = ({ pendingRequest, len, reject, accept, loading, error }: ExportModalProps): JSX.Element => {
  const {
    host,
    operation,
    payload,
    faviconUrl,
    onAccept,
    onReject,
    onOpenCircuitFile,
    onOpenVerificationKeyFile,
    onOpenZkeyFile,
  } = useExportModal({
    pendingRequest,
    accept,
    reject,
  });

  return (
    <FullModal className="confirm-modal" data-testid="proof-modal" onClose={onReject}>
      <FullModalHeader>{operation}</FullModalHeader>

      <FullModalContent className="flex flex-col items-center" children={undefined}></FullModalContent>

      <FullModalFooter>
        <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={onReject}>
          Reject
        </Button>

        <Button className="ml-2" loading={loading} onClick={onAccept}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};
