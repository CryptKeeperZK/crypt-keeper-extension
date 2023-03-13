import { PendingRequest, PendingRequestType } from "@src/types";
import { getLinkPreview } from "link-preview-js";
import { useState, useEffect } from "react";
import Button, { ButtonType } from "../../Button";
import FullModal, { FullModalHeader, FullModalContent, FullModalFooter } from "../../FullModal";
import Icon from "../../Icon";
import Input from "../../Input";

interface ProofModalProps {
  len: number;
  reject: () => void;
  accept: () => void;
  loading: boolean;
  error: string;
  pendingRequest?: PendingRequest;
}

interface ProofRequest {
  externalNullifier: string;
  signal: string;
  merkleStorageAddress?: string;
  circuitFilePath: string;
  verificationKey: string;
  zkeyFilePath: string;
  origin: string;
}

type ProofType = PendingRequestType.SEMAPHORE_PROOF | PendingRequestType.RLN_PROOF;

const PROOF_MODAL_TITLES: Record<ProofType, string> = {
  [PendingRequestType.SEMAPHORE_PROOF]: "Generate Semaphore Proof",
  [PendingRequestType.RLN_PROOF]: "Generate RLN Proof",
};

export function ProofModal({ pendingRequest, len, reject, accept, loading, error }: ProofModalProps) {
  const { payload } = pendingRequest || {};
  const {
    circuitFilePath,
    externalNullifier,
    signal,
    zkeyFilePath,
    origin: host,
    verificationKey,
  } = (payload || {}) as Partial<ProofRequest>;
  const operation = PROOF_MODAL_TITLES[pendingRequest?.type as ProofType] || "Generate proof";

  const [faviconUrl, setFaviconUrl] = useState("");

  useEffect(() => {
    (async () => {
      if (host) {
        const data = await getLinkPreview(host).catch(() => undefined);
        const [favicon] = data?.favicons || [];
        setFaviconUrl(favicon);
      }
    })();
  }, [host]);

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
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
            <Icon fontAwesome="fas fa-link" onClick={() => window.open(circuitFilePath, "_blank")} />
          </div>
          <div className="semaphore-proof__file">
            <div className="semaphore-proof__file__title">ZKey</div>
            <Icon fontAwesome="fas fa-link" onClick={() => window.open(zkeyFilePath, "_blank")} />
          </div>
          <div className="semaphore-proof__file">
            <div className="semaphore-proof__file__title">Verification</div>
            <Icon fontAwesome="fas fa-link" onClick={() => window.open(verificationKey, "_blank")} />
          </div>
          {/* TODO: check Merkle output */}
          {/* <div className="semaphore-proof__file">
              <div className="semaphore-proof__file__title">Merkle</div>
              {typeof merkleProof === "string" ? (
                <Icon fontAwesome="fas fa-link" onClick={() => window.open(merkleProof, "_blank")} />
              ) : (
                <Icon fontAwesome="fas fa-copy" onClick={() => copy(JSON.stringify(merkleProof))} />
              )}
            </div> */}
        </div>

        <Input readOnly className="w-full mb-2" label="External Nullifier" defaultValue={externalNullifier} />
        <Input readOnly className="w-full mb-2" label="Signal" defaultValue={signal} />
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}
      <FullModalFooter>
        <Button btnType={ButtonType.secondary} onClick={reject} loading={loading}>
          Reject
        </Button>
        <Button className="ml-2" onClick={accept} loading={loading}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
