import { IPendingRequest, PendingRequestType, IZKProofPayload } from "@cryptkeeperzk/types";
import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";

export interface IUseSemaphoreProofModalArgs {
  pendingRequest: IPendingRequest<IZKProofPayload>;
  accept: () => void;
  reject: () => void;
}

export interface IUseSemaphoreProofModalData {
  urlOrigin: string;
  faviconUrl: string;
  operation: string;
  payload?: IZKProofPayload;
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

export const useSemaphoreProofModal = ({
  pendingRequest,
  accept,
  reject,
}: IUseSemaphoreProofModalArgs): IUseSemaphoreProofModalData => {
  const [faviconUrl, setFaviconUrl] = useState("");
  const operation = PROOF_MODAL_TITLES[pendingRequest?.type as ProofType] || "Generate proof";
  const { urlOrigin = "", circuitFilePath, zkeyFilePath, verificationKey } = pendingRequest.payload || {};

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
    if (!urlOrigin) {
      return;
    }

    getLinkPreview(urlOrigin).then((data) => {
      const [favicon] = data.favicons;
      setFaviconUrl(favicon);
    });
  }, [urlOrigin, setFaviconUrl]);

  return {
    urlOrigin,
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
