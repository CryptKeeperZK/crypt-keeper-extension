/* eslint-disable no-console */
import {
  initializeCryptKeeper,
  ICryptKeeperInjectedProvider,
  EventName,
  RPCExternalAction,
} from "@cryptkeeperzk/providers";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import { MERKLE_STORAGE_URL } from "@src/constants";
import { MerkleProofType } from "@src/types";
import {
  genMockIdentityCommitments,
  genMockVerifiableCredential,
  genMockVerifiablePresentationRequest,
} from "@src/utils";

import type {
  ISemaphoreFullProof,
  IMerkleProofArtifacts,
  IRLNFullProof,
  ConnectedIdentityMetadata,
  IVerifiablePresentation,
  IMerkleProof,
} from "@cryptkeeperzk/types";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";

interface IUseCryptKeeperData {
  client?: ICryptKeeperInjectedProvider;
  addVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  generateVerifiablePresentationRequest: () => Promise<void>;
}

export const useCryptKeeper = (): IUseCryptKeeperData => {
  const { client } = useCryptKeeperClient();


  const addVerifiableCredentialRequest = useCallback(
    async (credentialType: string) => {
      const mockVerifiableCredential = genMockVerifiableCredential(credentialType);
      const verifiableCredentialJson = JSON.stringify(mockVerifiableCredential);

      await client?.request({
        method: RPCExternalAction.ADD_VERIFIABLE_CREDENTIAL,
        payload: verifiableCredentialJson,
      });
    },
    [client],
  );

  const generateVerifiablePresentationRequest = useCallback(async () => {
    const verifiablePresentationRequest = genMockVerifiablePresentationRequest();
    await client?.request({
      method: RPCExternalAction.GENERATE_VERIFIABLE_PRESENTATION,
      payload: verifiablePresentationRequest,
    });
  }, [client]);

  

  
  

  return {
    addVerifiableCredentialRequest,
    generateVerifiablePresentationRequest,
  };
};
