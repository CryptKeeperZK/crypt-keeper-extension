import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { IVerifiableCredential, IVerifiablePresentationRequest } from "@cryptkeeperzk/types";
import { bigintToHex } from "bigint-conversion";

export const genMockIdentityCommitments = (): string[] => {
  const identityCommitments: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const mockIdentity = new Identity();
    const idCommitment = bigintToHex(mockIdentity.getCommitment());

    identityCommitments.push(idCommitment);
  }
  return identityCommitments;
};

export const genMockVerifiableCredential = (credentialType: string): IVerifiableCredential => {
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

export const genMockVerifiablePresentationRequest = (): IVerifiablePresentationRequest => ({
  request: "Please provide your University Degree Credential AND Drivers License Credential.",
});

export const ellipsify = (text: string, start = 6, end = 4): string => {
  if (text.length - end <= start) {
    return text;
  }

  return `${text.slice(0, start)}...${text.slice(text.length - end, text.length)}`;
};

export const loadFile = async (filePath: string): Promise<string> => {
  const response = await fetch(filePath);
  const data: string = await response.text();
  return data;
};

export const replaceUrlParams = (path: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((acc, [key, value]) => acc.replace(`:${key}`, value), path);
