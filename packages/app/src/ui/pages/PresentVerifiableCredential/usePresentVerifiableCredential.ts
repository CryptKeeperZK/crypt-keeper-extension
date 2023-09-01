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

export type PresentVerifiableCredentialDisplayState = "select" | "sign";

export interface IUsePresentVerifiableCredentialData {
  verifiablePresentationRequest?: string;
  cryptkeeperVerifiableCredentials: CryptkeeperVerifiableCredential[];
  selectedVerifiableCredentialHashes: string[];
  displayState: PresentVerifiableCredentialDisplayState;
  error?: string;
  onCloseModal: () => void;
  onRejectRequest: () => void;
  onToggleSelection: (hash: string) => void;
  onConfirmSelection: () => void;
  onReturnToSelection: () => void;
  onGenerateVerifiablePresentation: () => Promise<void>;
}

export const usePresentVerifiableCredential = (): IUsePresentVerifiableCredentialData => {
  const [displayState, setDisplayState] = useState<PresentVerifiableCredentialDisplayState>("select");
  const [error, setError] = useState<string>();
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

  const onRejectVerifiablePresentationRequest = useCallback(async () => {
    await dispatch(rejectVerifiablePresentationRequest());
    onCloseModal();
  }, [rejectVerifiablePresentationRequest, dispatch, onCloseModal]);

  const onToggleSelectVerifiableCredential = useCallback(
    (selectedHash: string) => {
      if (error) {
        setError(undefined);
      }

      if (selectedVerifiableCredentialHashes.includes(selectedHash)) {
        setSelectedVerifiableCredentialHashes((hashes) => hashes.filter((hash) => hash !== selectedHash));
      } else {
        setSelectedVerifiableCredentialHashes((hashes) => [...hashes, selectedHash]);
      }
    },
    [selectedVerifiableCredentialHashes, setSelectedVerifiableCredentialHashes, error, setError],
  );

  const onConfirmVerifiableCredentialSelection = useCallback(() => {
    if (selectedVerifiableCredentialHashes.length === 0) {
      setError("Please select at least one credential");
      return;
    }
    setDisplayState("sign");
  }, [setDisplayState, selectedVerifiableCredentialHashes, setError]);

  const onReturnToVerifiableCredentialSelection = useCallback(() => {
    setDisplayState("select");
  }, [setDisplayState]);

  const onGenerateVerifiablePresentation = useCallback(async () => {
    await dispatch(generateVerifiablePresentation(selectedVerifiableCredentialHashes));
    onCloseModal();
  }, [selectedVerifiableCredentialHashes, generateVerifiablePresentation, dispatch, onCloseModal]);

  return {
    verifiablePresentationRequest,
    cryptkeeperVerifiableCredentials,
    selectedVerifiableCredentialHashes,
    displayState,
    error,
    onCloseModal,
    onRejectRequest: onRejectVerifiablePresentationRequest,
    onToggleSelection: onToggleSelectVerifiableCredential,
    onConfirmSelection: onConfirmVerifiableCredentialSelection,
    onReturnToSelection: onReturnToVerifiableCredentialSelection,
    onGenerateVerifiablePresentation,
  };
};
