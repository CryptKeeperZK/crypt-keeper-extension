import { useCallback, useEffect, useState } from "react";

import {
  generateVerifiablePresentationFromVerifiableCredentials,
  serializeVerifiablePresentation,
} from "@src/background/services/credentials/utils";
import { CryptkeeperVerifiableCredential, VerifiablePresentation } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  fetchVerifiableCredentials,
  rejectVerifiablePresentationRequest,
  generateVerifiablePresentation,
} from "@src/ui/ducks/verifiableCredentials";
import { useCryptkeeperVerifiableCredentials } from "@src/ui/hooks/verifiableCredentials";
import { useEthWallet } from "@src/ui/hooks/wallet";

const ETHEREUM_SIGNATURE_SPECIFICATION_TYPE = "EthereumEip712Signature2021";
const VERIFIABLE_CREDENTIAL_PROOF_PURPOSE = "assertionMethod";

export type PresentVerifiableCredentialDisplayState = "select" | "sign";

export interface IUsePresentVerifiableCredentialData {
  isWalletConnected: boolean;
  isWalletInstalled: boolean;
  verifiablePresentationRequest?: string;
  cryptkeeperVerifiableCredentials: CryptkeeperVerifiableCredential[];
  selectedVerifiableCredentialHashes: string[];
  verifiablePresentation?: VerifiablePresentation;
  error?: string;
  onCloseModal: () => void;
  onRejectRequest: () => void;
  onToggleSelection: (hash: string) => void;
  onConfirmSelection: () => void;
  onReturnToSelection: () => void;
  onConnectWallet: () => Promise<void>;
  onSubmitVerifiablePresentation: (needsSignature: boolean) => Promise<void>;
}

export const usePresentVerifiableCredential = (): IUsePresentVerifiableCredentialData => {
  const [verifiablePresentationRequest, setVerifiablePresentationRequest] = useState<string>();
  const cryptkeeperVerifiableCredentials = useCryptkeeperVerifiableCredentials();
  const [selectedVerifiableCredentialHashes, setSelectedVerifiableCredentialHashes] = useState<string[]>([]);
  const [verifiablePresentation, setVerifiablePresentation] = useState<VerifiablePresentation>();
  const [error, setError] = useState<string>();

  const ethWallet = useEthWallet();
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

    const verifiableCredentials = cryptkeeperVerifiableCredentials
      .filter((cryptkeeperVerifiableCredential) =>
        selectedVerifiableCredentialHashes.includes(cryptkeeperVerifiableCredential.metadata.hash),
      )
      .map((cryptkeeperVerifiableCredential) => cryptkeeperVerifiableCredential.verifiableCredential);
    const newVerifiablePresentation = generateVerifiablePresentationFromVerifiableCredentials(verifiableCredentials);

    setVerifiablePresentation(newVerifiablePresentation);
  }, [cryptkeeperVerifiableCredentials, selectedVerifiableCredentialHashes, setVerifiablePresentation, setError]);

  const onReturnToVerifiableCredentialSelection = useCallback(() => {
    setVerifiablePresentation(undefined);
  }, [setVerifiablePresentation]);

  const onConnectWallet = useCallback(async () => {
    await ethWallet.onConnect().catch(() => setError("Wallet connection error"));
  }, [setError, ethWallet.onConnect]);

  const onSubmitVerifiablePresentation = useCallback(
    async (needsSignature: boolean) => {
      if (!verifiablePresentation) {
        setError("Failed to generate Verifiable Presentation.");
        return;
      }

      if (!needsSignature) {
        await dispatch(generateVerifiablePresentation(verifiablePresentation));
        onCloseModal();
        return;
      }

      const address = ethWallet.address?.toLowerCase();
      const signer = await ethWallet.provider?.getSigner();
      if (!address || !signer) {
        setError("Could not connect to Ethereum account.");
        return;
      }

      try {
        const serializedVerifiablePresentation = serializeVerifiablePresentation(verifiablePresentation);
        const signature = await signer.signMessage(serializedVerifiablePresentation);
        const signedVerifiablePresentation = {
          ...verifiablePresentation,
          proof: [
            {
              type: [ETHEREUM_SIGNATURE_SPECIFICATION_TYPE],
              proofPurpose: VERIFIABLE_CREDENTIAL_PROOF_PURPOSE,
              verificationMethod: address,
              created: new Date(),
              proofValue: signature,
            },
          ],
        };

        await dispatch(generateVerifiablePresentation(signedVerifiablePresentation));
        onCloseModal();
      } catch (e) {
        setError("Failed to sign Verifiable Presentation.");
      }
    },
    [verifiablePresentation, setError, dispatch, onCloseModal, generateVerifiablePresentation, ethWallet],
  );

  return {
    isWalletInstalled: ethWallet.isInjectedWallet,
    isWalletConnected: ethWallet.isActive,
    verifiablePresentationRequest,
    cryptkeeperVerifiableCredentials,
    selectedVerifiableCredentialHashes,
    verifiablePresentation,
    error,
    onCloseModal,
    onRejectRequest: onRejectVerifiablePresentationRequest,
    onToggleSelection: onToggleSelectVerifiableCredential,
    onConfirmSelection: onConfirmVerifiableCredentialSelection,
    onReturnToSelection: onReturnToVerifiableCredentialSelection,
    onConnectWallet,
    onSubmitVerifiablePresentation,
  };
};
