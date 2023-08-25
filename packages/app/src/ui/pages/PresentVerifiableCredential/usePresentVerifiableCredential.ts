import { useCallback, useEffect, useState } from "react";

import { CryptkeeperVerifiableCredential } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  fetchVerifiableCredentials,
  generateVerifiablePresentation,
  rejectVerifiablePresentationRequest,
} from "@src/ui/ducks/verifiableCredentials";
import { useCryptkeeperVerifiableCredentials } from "@src/ui/hooks/verifiableCredentials";

export const defaultVerifiableCredentialName = "Verifiable Credential";

export interface IUsePresentVerifiableCredentialData {
  verifiablePresentationRequest?: string;
  cryptkeeperVerifiableCredentials: CryptkeeperVerifiableCredential[];
  selectedVerifiableCredentialHashes: string[];
  onCloseModal: () => void;
  onGenerateVerifiablePresentation: () => Promise<void>;
  onRejectVerifiablePresentationRequest: () => void;
  onToggleSelectVerifiableCredential: (hash: string) => void;
}

export const usePresentVerifiableCredential = (): IUsePresentVerifiableCredentialData => {
  const [verifiablePresentationRequest, setVerifiablePresentationRequest] = useState<string>();
  const cryptkeeperVerifiableCredentials = useCryptkeeperVerifiableCredentials();
  const [selectedVerifiableCredentialHashes, setSelectedVerifiableCredentialHashes] = useState<string[]>([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    function getPresentationRequest() {
      const { searchParams } = new URL(window.location.href.replace("#", ""));
      const request = searchParams.get("request");

      if (!request) {
        return;
      }

      dispatch(fetchVerifiableCredentials());

      setVerifiablePresentationRequest(request);
    }
    getPresentationRequest();
  }, [setVerifiablePresentationRequest, fetchVerifiableCredentials, dispatch]);

  const onCloseModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  const onGenerateVerifiablePresentation = useCallback(async () => {
    await dispatch(generateVerifiablePresentation(selectedVerifiableCredentialHashes));
    onCloseModal();
  }, [selectedVerifiableCredentialHashes, generateVerifiablePresentation, dispatch, onCloseModal]);

  const onRejectVerifiablePresentationRequest = useCallback(async () => {
    await dispatch(rejectVerifiablePresentationRequest());
    onCloseModal();
  }, [rejectVerifiablePresentationRequest, dispatch, onCloseModal]);

  const onToggleSelectVerifiableCredential = useCallback(
    (selectedHash: string) => {
      if (selectedVerifiableCredentialHashes.includes(selectedHash)) {
        setSelectedVerifiableCredentialHashes((hashes) => hashes.filter((hash) => hash !== selectedHash));
      } else {
        setSelectedVerifiableCredentialHashes((hashes) => [...hashes, selectedHash]);
      }
    },
    [selectedVerifiableCredentialHashes, setSelectedVerifiableCredentialHashes],
  );

  return {
    verifiablePresentationRequest,
    cryptkeeperVerifiableCredentials,
    selectedVerifiableCredentialHashes,
    onCloseModal,
    onGenerateVerifiablePresentation,
    onRejectVerifiablePresentationRequest,
    onToggleSelectVerifiableCredential,
  };
};
