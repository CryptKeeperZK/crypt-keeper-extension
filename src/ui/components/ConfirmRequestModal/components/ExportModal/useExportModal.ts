import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";

import { PendingRequest, PendingRequestType, ZKProofPayload } from "@src/types";

export interface IUseProofModalArgs {
  pendingRequest: PendingRequest<ZKProofPayload>;
  accept: () => void;
  reject: () => void;
}

export interface IUseProofModalData {
  host: string;
  faviconUrl: string;
  operation: string;
  payload?: ZKProofPayload;
  onAccept: () => void;
  onReject: () => void;
  onOpenCircuitFile: () => void;
  onOpenZkeyFile: () => void;
  onOpenVerificationKeyFile: () => void;
}

type ProofType = PendingRequestType.SEMAPHORE_PROOF | PendingRequestType.RLN_PROOF;

const PROOF_MODAL_TITLES: Record<ProofType, string> = {
  [PendingRequestType.SEMAPHORE_PROOF]: "Generate Semaphore Proof",
  [PendingRequestType.RLN_PROOF]: "Generate RLN Proof",
};

export const useExportModal = ({ pendingRequest, accept, reject }: IUseProofModalArgs): IUseProofModalData => {
  const [faviconUrl, setFaviconUrl] = useState("");
  const operation = PROOF_MODAL_TITLES[pendingRequest?.type as ProofType] || "Export Identities";
  const { origin: host = "", circuitFilePath, zkeyFilePath, verificationKey } = pendingRequest.payload || {};

  const onAccept = useCallback(() => {
    accept();
  }, [accept]);

  const onReject = useCallback(() => {
    reject();
  }, [reject]);

  const onOpenCircuitFile = useCallback(() => window.open(circuitFilePath, "_blank"), [window, circuitFilePath]);

  const onOpenZkeyFile = useCallback(() => window.open(zkeyFilePath, "_blank"), [window, zkeyFilePath]);

  const onOpenVerificationKeyFile = useCallback(
    () => window.open(verificationKey, "_blank"),
    [window, verificationKey],
  );

  useEffect(() => {
    if (!host) {
      return;
    }

    getLinkPreview(host).then((data) => {
      const [favicon] = data.favicons;
      setFaviconUrl(favicon);
    });
  }, [host, setFaviconUrl]);

  return {
    host,
    payload: pendingRequest.payload,
    operation,
    faviconUrl,
    onAccept,
    onReject,
    onOpenCircuitFile,
    onOpenZkeyFile,
    onOpenVerificationKeyFile,
  };
};
