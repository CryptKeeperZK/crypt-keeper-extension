import * as React from "react";
import { useCallback, useEffect, useState } from "react";

import { generateVPFromVC, serializeVP } from "@src/background/services/credentials/utils";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  fetchVerifiableCredentials,
  rejectVerifiablePresentationRequest,
  submitVerifiablePresentation,
  signAndSubmitVerifiablePresentation,
} from "@src/ui/ducks/verifiableCredentials";
import { useCryptkeeperVerifiableCredentials } from "@src/ui/hooks/verifiableCredentials";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";

import type { IVerifiablePresentation } from "@cryptkeeperzk/types";
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
  vpRequest?: string;
  cryptkeeperVCs: ICryptkeeperVerifiableCredential[];
  selectedVCHashes: string[];
  error?: string;
  isMenuOpen: boolean;
  menuSelectedIndex: number;
  menuRef: React.RefObject<HTMLDivElement>;
  onCloseModal: () => void;
  onRejectRequest: () => void;
  onToggleSelection: (hash: string) => void;
  onToggleMenu: () => void;
  onMenuItemClick: (index: number) => void;
  onSubmit: () => Promise<void>;
}

export const usePresentVerifiableCredential = (): IUsePresentVerifiableCredentialData => {
  const [vpRequest, setVPRequest] = useState<string>();
  const cryptkeeperVCs = useCryptkeeperVerifiableCredentials();
  const [selectedVCHashes, setSelectedVCHashes] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuSelectedIndex, setMenuSelectedIndex] = React.useState(0);
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

    setVPRequest(request);
  }, [setVPRequest, fetchVerifiableCredentials, dispatch]);

  const onCloseModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  const onRejectVPRequest = useCallback(async () => {
    await dispatch(rejectVerifiablePresentationRequest());
    onCloseModal();
  }, [rejectVerifiablePresentationRequest, dispatch, onCloseModal]);

  const onToggleSelectVC = useCallback(
    (selectedHash: string) => {
      if (error) {
        setError(undefined);
      }

      if (selectedVCHashes.includes(selectedHash)) {
        setSelectedVCHashes((hashes) => hashes.filter((hash) => hash !== selectedHash));
      } else {
        setSelectedVCHashes((hashes) => [...hashes, selectedHash]);
      }
    },
    [selectedVCHashes, setSelectedVCHashes, error, setError],
  );

  const createVPFromSelectedVCs = (): IVerifiablePresentation | undefined => {
    if (selectedVCHashes.length === 0) {
      setError("Please select at least one credential.");
      return undefined;
    }

    const verifiableCredentials = cryptkeeperVCs
      .filter((cryptkeeperVC) => selectedVCHashes.includes(cryptkeeperVC.metadata.hash))
      .map((cryptkeeperVC) => cryptkeeperVC.vc);

    return generateVPFromVC(verifiableCredentials);
  };

  const onToggleMenu = useCallback(() => {
    setIsMenuOpen((prevOpen) => !prevOpen);
  }, [setIsMenuOpen]);

  const onMenuItemClick = useCallback(
    (index: number) => {
      setMenuSelectedIndex(index);
      setIsMenuOpen(false);
    },
    [setMenuSelectedIndex, setIsMenuOpen],
  );

  const onConnectWallet = useCallback(async () => {
    try {
      await ethWallet.onConnect();
    } catch (e) {
      setError("Wallet connection error");
    }
  }, [setError, ethWallet.onConnect]);

  const onSubmitWithMetamask = useCallback(async () => {
    const verifiablePresentation = createVPFromSelectedVCs();

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
      const serializedVP = serializeVP(verifiablePresentation);
      const signature = await signer.signMessage(serializedVP);
      const signedVP = {
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

      await dispatch(submitVerifiablePresentation(signedVP));
      onCloseModal();
    } catch (e) {
      setError("Failed to sign Verifiable Presentation.");
    }
  }, [ethWallet, setError, dispatch, onCloseModal, submitVerifiablePresentation, createVPFromSelectedVCs]);

  const onSubmitWithCryptkeeper = useCallback(async () => {
    const vp = createVPFromSelectedVCs();

    if (!vp) {
      return;
    }

    const address = cryptKeeperWallet.address?.toLowerCase();

    if (!address) {
      setError("Could not connect to Cryptkeeper account.");
      return;
    }

    await dispatch(signAndSubmitVerifiablePresentation({ vp, address }));
    onCloseModal();
  }, [
    cryptKeeperWallet,
    setError,
    dispatch,
    onCloseModal,
    signAndSubmitVerifiablePresentation,
    createVPFromSelectedVCs,
  ]);

  const onSubmitWithoutSignature = useCallback(async () => {
    const verifiablePresentation = createVPFromSelectedVCs();

    if (!verifiablePresentation) {
      return;
    }

    await dispatch(submitVerifiablePresentation(verifiablePresentation));
    onCloseModal();
  }, [setError, dispatch, onCloseModal, submitVerifiablePresentation, createVPFromSelectedVCs]);

  const onSubmit = useCallback(async () => {
    switch (true) {
      case menuSelectedIndex === (MenuItems.METAMASK as number) && !isWalletConnected:
        return onConnectWallet();
      case menuSelectedIndex === (MenuItems.METAMASK as number) && isWalletConnected:
        return onSubmitWithMetamask();
      case menuSelectedIndex === (MenuItems.CRYPTKEEPER as number):
        return onSubmitWithCryptkeeper();
      case menuSelectedIndex === (MenuItems.WITHOUT_SIGNATURE as number):
        return onSubmitWithoutSignature();
      default:
        setError("Invalid menu index.");
        return undefined;
    }
  }, [
    menuSelectedIndex,
    isWalletConnected,
    onConnectWallet,
    onSubmitWithMetamask,
    onSubmitWithCryptkeeper,
    onSubmitWithoutSignature,
  ]);

  return {
    isWalletInstalled: ethWallet.isInjectedWallet,
    isWalletConnected,
    vpRequest,
    cryptkeeperVCs,
    selectedVCHashes,
    error,
    isMenuOpen,
    menuSelectedIndex,
    menuRef,
    onCloseModal,
    onRejectRequest: onRejectVPRequest,
    onToggleSelection: onToggleSelectVC,
    onToggleMenu,
    onMenuItemClick,
    onSubmit,
  };
};
