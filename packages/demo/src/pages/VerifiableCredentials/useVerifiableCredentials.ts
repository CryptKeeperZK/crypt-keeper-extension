import { EventName, RPCExternalAction } from "@cryptkeeperzk/providers";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";

import type {
  IVerifiableCredential,
  IVerifiablePresentation,
  IVerifiablePresentationRequest,
} from "@cryptkeeperzk/types";

interface IUseVerifiableCredentialsData {
  addVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  generateVerifiablePresentationRequest: () => Promise<void>;
}

const genMockVerifiableCredential = (credentialType: string): IVerifiableCredential => {
  const mockVerifiableCredentialMap: Record<string, IVerifiableCredential> = {
    UniversityDegreeCredential: {
      context: ["https://www.w3.org/2018/credentials/v1"],
      id: "http://example.edu/credentials/1872",
      type: ["VerifiableCredential", "UniversityDegreeCredential"],
      issuer: {
        id: "did:example:76e12ec712ebc6f1c221ebfeb1f",
      },
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        claims: {
          type: "BachelorDegree",
          name: "Bachelor of Science and Arts",
        },
      },
    },
    DriversLicenseCredential: {
      context: ["https://www.w3.org/2018/credentials/v1"],
      id: "http://example.edu/credentials/1873",
      type: ["VerifiableCredential", "DriversLicenseCredential"],
      issuer: {
        id: "did:example:76e12ec712ebc6f1c221ebfeb1e",
      },
      issuanceDate: new Date("2020-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        claims: {
          name: "John Smith",
          licenseNumber: "123-abc",
        },
      },
    },
  };

  if (!(credentialType in mockVerifiableCredentialMap)) {
    throw new Error("Invalid credential type");
  }

  return mockVerifiableCredentialMap[credentialType];
};

const genMockVerifiablePresentationRequest = (): IVerifiablePresentationRequest => ({
  request: "Please provide your University Degree Credential AND Drivers License Credential.",
});

export const useVerifiableCredentials = (): IUseVerifiableCredentialsData => {
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

  const onAddVerifiableCredential = useCallback((payload: unknown) => {
    const { verifiableCredentialHash } = payload as { verifiableCredentialHash: string };

    toast(`Added a Verifiable Credential! ${verifiableCredentialHash}`, { type: "success" });
  }, []);

  const onGenerateVerifiablePresentation = useCallback((payload: unknown) => {
    const {
      verifiablePresentation: { verifiableCredential: credentialList },
    } = payload as { verifiablePresentation: IVerifiablePresentation };
    const credentialCount = credentialList ? credentialList.length : 0;

    toast(`Generated a Verifiable Presentation from ${credentialCount} credentials!`, { type: "success" });
  }, []);

  // Listen to Injected CryptKeeper Provider Client Events
  useEffect(() => {
    if (!client) {
      return undefined;
    }

    client.on(EventName.ADD_VERIFIABLE_CREDENTIAL, onAddVerifiableCredential);
    client.on(EventName.GENERATE_VERIFIABLE_PRESENTATION, onGenerateVerifiablePresentation);

    return () => {
      client.cleanListeners();
    };
  }, [client, onAddVerifiableCredential, onGenerateVerifiablePresentation]);

  return {
    addVerifiableCredentialRequest,
    generateVerifiablePresentationRequest,
  };
};
