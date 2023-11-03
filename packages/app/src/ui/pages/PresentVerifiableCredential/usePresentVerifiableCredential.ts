import { EventName } from "@cryptkeeperzk/providers";
import { useCallback, useEffect, useState } from "react";

import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { fetchVCs, generateVP, generateVPWithCryptkeeper } from "@src/ui/ducks/verifiableCredentials";
import { useSearchParam } from "@src/ui/hooks/url";
import { useCryptkeeperVCs } from "@src/ui/hooks/verifiableCredentials";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import { generateVPFromVCs, serializeVP } from "@src/util/credentials";

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
  checkDisabledItem: (index: number) => boolean;
  onCloseModal: () => void;
  onReject: () => void;
  onSelect: (hash: string) => void;
  onSubmit: (index: number) => Promise<void>;
}

export const usePresentVerifiableCredential = (): IUsePresentVerifiableCredentialData => {
  const [vpRequest, setVPRequest] = useState<string>();
  const cryptkeeperVCs = useCryptkeeperVCs();
  const [selectedVCHashes, setSelectedVCHashes] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  const ethWallet = useEthWallet();
  const cryptKeeperWallet = useCryptKeeperWallet();
  const dispatch = useAppDispatch();
  const isWalletConnected = ethWallet.isActive;
  const request = useSearchParam("request");
  const urlOrigin = useSearchParam("urlOrigin");

  useEffect(() => {
    if (!request) {
      return;
    }

    dispatch(fetchVCs());

    setVPRequest(request);
  }, [request, setVPRequest, dispatch]);

  const checkDisabledItem = useCallback(
    (index: number): boolean =>
      selectedVCHashes.length === 0 || (index === (MenuItems.METAMASK as number) && !ethWallet.isInjectedWallet),
    [selectedVCHashes.length, ethWallet.isInjectedWallet],
  );

  const onCloseModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  const onReject = useCallback(async () => {
    await dispatch(rejectUserRequest({ type: EventName.VERIFIABLE_PRESENTATION_REQUEST, payload: {} }, urlOrigin));
    onCloseModal();
  }, [urlOrigin, dispatch, onCloseModal]);

  const onSelect = useCallback(
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
    [selectedVCHashes, error, setSelectedVCHashes, setError],
  );

  const createVPFromVCs = useCallback(() => {
    if (selectedVCHashes.length === 0) {
      setError("Please select at least one credential.");
      return undefined;
    }

    const verifiableCredentials = cryptkeeperVCs
      .filter((cryptkeeperVerifiableCredential) =>
        selectedVCHashes.includes(cryptkeeperVerifiableCredential.metadata.hash),
      )
      .map((cryptkeeperVerifiableCredential) => cryptkeeperVerifiableCredential.verifiableCredential);

    return generateVPFromVCs(verifiableCredentials);
  }, [cryptkeeperVCs, selectedVCHashes, setError]);

  const onConnectWallet = useCallback(async () => {
    try {
      await ethWallet.onConnect();
    } catch (e) {
      setError("Wallet connection error");
    }
  }, [setError, ethWallet.onConnect]);

  const onSubmitVPWithMetamask = useCallback(async () => {
    const vp = createVPFromVCs();

    if (!vp) {
      return;
    }

    const address = ethWallet.address?.toLowerCase();
    const signer = await ethWallet.provider?.getSigner();

    if (!address || !signer) {
      setError("Could not connect to Ethereum account.");
      return;
    }

    try {
      const serialized = serializeVP(vp);
      const signature = await signer.signMessage(serialized);
      const created = new Date();

      await dispatch(
        generateVP(
          {
            ...vp,
            proof: [
              {
                type: [ETHEREUM_SIGNATURE_SPECIFICATION_TYPE],
                proofPurpose: VERIFIABLE_CREDENTIAL_PROOF_PURPOSE,
                verificationMethod: address,
                created,
                proofValue: signature,
              },
            ],
          },
          urlOrigin!,
        ),
      );
      onCloseModal();
    } catch (e) {
      setError("Failed to sign Verifiable Presentation.");
    }
  }, [ethWallet, setError, dispatch, onCloseModal, generateVP, createVPFromVCs]);

  const onSubmitVPWithCryptkeeper = useCallback(async () => {
    const vp = createVPFromVCs();

    if (!vp) {
      return;
    }

    const address = cryptKeeperWallet.address?.toLowerCase();

    if (!address) {
      setError("Could not connect to CryptKeeper account.");
      return;
    }

    await dispatch(generateVPWithCryptkeeper({ verifiablePresentation: vp, address }, urlOrigin!));
    onCloseModal();
  }, [cryptKeeperWallet, setError, dispatch, onCloseModal, createVPFromVCs]);

  const onSubmitVPWithoutSignature = useCallback(async () => {
    const vp = createVPFromVCs();

    if (!vp) {
      return;
    }

    await dispatch(generateVP(vp, urlOrigin!));
    onCloseModal();
  }, [urlOrigin, setError, dispatch, onCloseModal, generateVP, createVPFromVCs]);

  const onSubmit = useCallback(
    async (menuSelectedIndex: number) => {
      switch (true) {
        case menuSelectedIndex === (MenuItems.METAMASK as number) && !isWalletConnected:
          return onConnectWallet();
        case menuSelectedIndex === (MenuItems.METAMASK as number) && isWalletConnected:
          return onSubmitVPWithMetamask();
        case menuSelectedIndex === (MenuItems.CRYPTKEEPER as number):
          return onSubmitVPWithCryptkeeper();
        case menuSelectedIndex === (MenuItems.WITHOUT_SIGNATURE as number):
          return onSubmitVPWithoutSignature();
        default:
          setError("Invalid menu index.");
          return undefined;
      }
    },
    [isWalletConnected, onConnectWallet, onSubmitVPWithMetamask, onSubmitVPWithCryptkeeper, onSubmitVPWithoutSignature],
  );

  return {
    isWalletInstalled: ethWallet.isInjectedWallet,
    isWalletConnected,
    vpRequest,
    cryptkeeperVCs,
    selectedVCHashes,
    error,
    checkDisabledItem,
    onCloseModal,
    onReject,
    onSelect,
    onSubmit,
  };
};
