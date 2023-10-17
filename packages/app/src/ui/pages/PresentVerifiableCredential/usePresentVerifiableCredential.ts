import { useCallback, useEffect, useState } from "react";

import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  fetchVerifiableCredentials,
  rejectVerifiablePresentationRequest,
  generateVerifiablePresentation,
  generateVerifiablePresentationWithCryptkeeper,
} from "@src/ui/ducks/verifiableCredentials";
import { useCryptkeeperVerifiableCredentials } from "@src/ui/hooks/verifiableCredentials";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import {
  generateVerifiablePresentationFromVerifiableCredentials,
  serializeVerifiablePresentation,
} from "@src/util/credentials";

import type { ICryptkeeperVerifiableCredential } from "@src/types";

const ETHEREUM_SIGNATURE_SPECIFICATION_TYPE = "EthereumEip712Signature2021";
const VERIFIABLE_CREDENTIAL_PROOF_PURPOSE = "assertionMethod";

export enum MenuItems {
  METAMASK = 0,
  CRYPTKEEPER = 1,
  WITHOUT_SIGNATURE = 2,
}

export interface IUsePresentVerifiableCredentialData {
  isWalletConnected: boolean;
  isWalletInstalled: boolean;
  verifiablePresentationRequest?: string;
  cryptkeeperVerifiableCredentials: ICryptkeeperVerifiableCredential[];
  selectedVerifiableCredentialHashes: string[];
  error?: string;
  checkDisabledItem: (index: number) => boolean;
  onCloseModal: () => void;
  onRejectRequest: () => void;
  onToggleSelection: (hash: string) => void;
  onSubmitVerifiablePresentation: (index: number) => Promise<void>;
}

export const usePresentVerifiableCredential = (): IUsePresentVerifiableCredentialData => {
  const [verifiablePresentationRequest, setVerifiablePresentationRequest] = useState<string>();
  const cryptkeeperVerifiableCredentials = useCryptkeeperVerifiableCredentials();
  const [selectedVerifiableCredentialHashes, setSelectedVerifiableCredentialHashes] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  const ethWallet = useEthWallet();
  const cryptKeeperWallet = useCryptKeeperWallet();
  const dispatch = useAppDispatch();
  const isWalletConnected = ethWallet.isActive;

  useEffect(() => {
    const { searchParams } = new URL(window.location.href.replace("#", ""));
    const request = searchParams.get("request");

    if (!request) {
      return;
    }

    dispatch(fetchVerifiableCredentials());

    setVerifiablePresentationRequest(request);
  }, [setVerifiablePresentationRequest, fetchVerifiableCredentials, dispatch]);

  const checkDisabledItem = useCallback(
    (index: number): boolean =>
      selectedVerifiableCredentialHashes.length === 0 ||
      (index === (MenuItems.METAMASK as number) && !ethWallet.isInjectedWallet),
    [selectedVerifiableCredentialHashes.length, ethWallet.isInjectedWallet],
  );

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

  const createVerifiablePresentationFromSelectedCredentials = useCallback(() => {
    if (selectedVerifiableCredentialHashes.length === 0) {
      setError("Please select at least one credential.");
      return undefined;
    }

    const verifiableCredentials = cryptkeeperVerifiableCredentials
      .filter((cryptkeeperVerifiableCredential) =>
        selectedVerifiableCredentialHashes.includes(cryptkeeperVerifiableCredential.metadata.hash),
      )
      .map((cryptkeeperVerifiableCredential) => cryptkeeperVerifiableCredential.verifiableCredential);

    return generateVerifiablePresentationFromVerifiableCredentials(verifiableCredentials);
  }, [cryptkeeperVerifiableCredentials, selectedVerifiableCredentialHashes, setError]);

  const onConnectWallet = useCallback(async () => {
    try {
      await ethWallet.onConnect();
    } catch (e) {
      setError("Wallet connection error");
    }
  }, [setError, ethWallet.onConnect]);

  const onSubmitVerifiablePresentationWithMetamask = useCallback(async () => {
    const verifiablePresentation = createVerifiablePresentationFromSelectedCredentials();

    if (!verifiablePresentation) {
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
      const created = new Date();
      const signedVerifiablePresentation = {
        ...verifiablePresentation,
        proof: [
          {
            type: [ETHEREUM_SIGNATURE_SPECIFICATION_TYPE],
            proofPurpose: VERIFIABLE_CREDENTIAL_PROOF_PURPOSE,
            verificationMethod: address,
            created,
            proofValue: signature,
          },
        ],
      };

      await dispatch(generateVerifiablePresentation(signedVerifiablePresentation));
      onCloseModal();
    } catch (e) {
      setError("Failed to sign Verifiable Presentation.");
    }
  }, [
    ethWallet,
    setError,
    dispatch,
    onCloseModal,
    generateVerifiablePresentation,
    createVerifiablePresentationFromSelectedCredentials,
  ]);

  const onSubmitVerifiablePresentationWithCryptkeeper = useCallback(async () => {
    const verifiablePresentation = createVerifiablePresentationFromSelectedCredentials();

    if (!verifiablePresentation) {
      return;
    }

    const address = cryptKeeperWallet.address?.toLowerCase();

    if (!address) {
      setError("Could not connect to CryptKeeper account.");
      return;
    }

    await dispatch(generateVerifiablePresentationWithCryptkeeper({ verifiablePresentation, address }));
    onCloseModal();
  }, [
    cryptKeeperWallet,
    setError,
    dispatch,
    onCloseModal,
    generateVerifiablePresentationWithCryptkeeper,
    createVerifiablePresentationFromSelectedCredentials,
  ]);

  const onSubmitVerifiablePresentationWithoutSignature = useCallback(async () => {
    const verifiablePresentation = createVerifiablePresentationFromSelectedCredentials();

    if (!verifiablePresentation) {
      return;
    }

    await dispatch(generateVerifiablePresentation(verifiablePresentation));
    onCloseModal();
  }, [
    setError,
    dispatch,
    onCloseModal,
    generateVerifiablePresentation,
    createVerifiablePresentationFromSelectedCredentials,
  ]);

  const onSubmitVerifiablePresentation = useCallback(
    async (menuSelectedIndex: number) => {
      switch (true) {
        case menuSelectedIndex === (MenuItems.METAMASK as number) && !isWalletConnected:
          return onConnectWallet();
        case menuSelectedIndex === (MenuItems.METAMASK as number) && isWalletConnected:
          return onSubmitVerifiablePresentationWithMetamask();
        case menuSelectedIndex === (MenuItems.CRYPTKEEPER as number):
          return onSubmitVerifiablePresentationWithCryptkeeper();
        case menuSelectedIndex === (MenuItems.WITHOUT_SIGNATURE as number):
          return onSubmitVerifiablePresentationWithoutSignature();
        default:
          setError("Invalid menu index.");
          return undefined;
      }
    },
    [
      isWalletConnected,
      onConnectWallet,
      onSubmitVerifiablePresentationWithMetamask,
      onSubmitVerifiablePresentationWithCryptkeeper,
      onSubmitVerifiablePresentationWithoutSignature,
    ],
  );

  return {
    isWalletInstalled: ethWallet.isInjectedWallet,
    isWalletConnected,
    verifiablePresentationRequest,
    cryptkeeperVerifiableCredentials,
    selectedVerifiableCredentialHashes,
    error,
    checkDisabledItem,
    onCloseModal,
    onRejectRequest: onRejectVerifiablePresentationRequest,
    onToggleSelection: onToggleSelectVerifiableCredential,
    onSubmitVerifiablePresentation,
  };
};
