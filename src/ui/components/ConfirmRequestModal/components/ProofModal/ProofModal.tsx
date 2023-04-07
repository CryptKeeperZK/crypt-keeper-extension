import { PendingRequest, ProofPayload } from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";

import "../../confirmModal.scss";

import { useProofModal } from "./useProofModal";

export interface ProofModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest<ProofPayload>;
  accept: () => void;
  reject: () => void;
}

export const ProofModal = ({ pendingRequest, len, reject, accept, loading, error }: ProofModalProps): JSX.Element => {
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
  } = useProofModal({
    pendingRequest,
    accept,
    reject,
  });

  return (
    <FullModal className="confirm-modal" data-testid="proof-modal" onClose={onReject}>
      <FullModalHeader>
        {operation}

        {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}
      </FullModalHeader>

      <FullModalContent className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0">
          <div
            className="w-16 h-16"
            style={{
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundImage: `url(${faviconUrl}`,
            }}
          />
        </div>

        <div className="text-lg font-semibold mb-2 text-center">{`${host} is requesting a semaphore proof`}</div>

        <div className="semaphore-proof__files flex flex-row items-center mb-2">
          <div className="semaphore-proof__file">
            <div className="semaphore-proof__file__title">Circuit</div>

            <Icon data-testid="circuit-file-link" fontAwesome="fas fa-link" onClick={onOpenCircuitFile} />
          </div>

          <div className="semaphore-proof__file">
            <div className="semaphore-proof__file__title">ZKey</div>

            <Icon data-testid="zkey-file-link" fontAwesome="fas fa-link" onClick={onOpenZkeyFile} />
          </div>

          <div className="semaphore-proof__file">
            <div className="semaphore-proof__file__title">Verification</div>

            <Icon
              data-testid="verification-key-file-link"
              fontAwesome="fas fa-link"
              onClick={onOpenVerificationKeyFile}
            />
          </div>
        </div>

        <Input readOnly className="w-full mb-2" defaultValue={payload?.externalNullifier} label="External Nullifier" />

        <Input readOnly className="w-full mb-2" defaultValue={payload?.signal} label="Signal" />
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

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
