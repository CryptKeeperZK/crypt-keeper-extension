import { IRLNProofRequest, IPendingRequest } from "@cryptkeeperzk/types";
import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";

export interface IUseRlnProofModalArgs {
  pendingRequest: IPendingRequest<Omit<IRLNProofRequest, "identitySerialized">>;
  accept: () => void;
  reject: () => void;
}

export interface IUseRlnProofModalData {
  urlOrigin?: string;
  faviconUrl: string;
  payload?: Omit<IRLNProofRequest, "identitySerialized">;
  onAccept: () => void;
  onReject: () => void;
  onOpenCircuitFile: () => void;
  onOpenZkeyFile: () => void;
  onOpenVerificationKeyFile: () => void;
}

export const useRlnProofModal = ({ pendingRequest, accept, reject }: IUseRlnProofModalArgs): IUseRlnProofModalData => {
  const [faviconUrl, setFaviconUrl] = useState("");
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
    faviconUrl,
    onAccept,
    onReject,
    onOpenCircuitFile,
    onOpenZkeyFile,
    onOpenVerificationKeyFile,
  };
};
