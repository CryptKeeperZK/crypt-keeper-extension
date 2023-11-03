import { ICryptkeeperVerifiableCredential } from "@src/types";
import { generateInitialMetadataForVC, serializeCryptkeeperVC, serializeVC } from "@src/util/credentials";

import type {
  IVerifiableCredential,
  IVerifiablePresentation,
  IVerifiablePresentationRequest,
} from "@cryptkeeperzk/types";

export const defaultCredentialName = "Verifiable Credential";

export const exampleCredential: IVerifiableCredential = {
  context: ["https://www.w3.org/2018/credentials/v1"],
  id: "did:example:123",
  type: ["VerifiableCredential"],
  issuer: "did:example:123456789abcdefghi",
  issuanceDate: new Date("2010-01-01T19:23:24Z"),
  credentialSubject: {
    id: "did:example:123456789abcdefghi",
    claims: {
      name: "John Doe",
    },
  },
};

export const exampleCredentialString = serializeVC(exampleCredential);

export const exampleCredentialMetadata = generateInitialMetadataForVC(exampleCredential, defaultCredentialName);

export const exampleCredentialHash = exampleCredentialMetadata.hash;

export const exampleCryptkeeperCredential: ICryptkeeperVerifiableCredential = {
  verifiableCredential: exampleCredential,
  metadata: exampleCredentialMetadata,
};

export const exampleCryptkeeperCredentialString = serializeCryptkeeperVC(exampleCryptkeeperCredential);

export const exampleCredentialTwo: IVerifiableCredential = {
  context: ["https://www.w3.org/2018/credentials/v1"],
  id: "did:example:1234",
  type: ["VerifiableCredential", "NameCredential"],
  issuer: "did:example:123456abcdefghi",
  issuanceDate: new Date("2010-01-02T19:23:24Z"),
  credentialSubject: {
    id: "did:example:123456abcdefghi",
    claims: {
      name: "Jane Doe",
    },
  },
};

export const exampleCredentialStringTwo = serializeVC(exampleCredentialTwo);

const exampleCredentialMetadataTwo = generateInitialMetadataForVC(exampleCredentialTwo, defaultCredentialName);
const exampleCredentialHashTwo = exampleCredentialMetadataTwo.hash;
const exampleCryptkeeperCredentialTwo: ICryptkeeperVerifiableCredential = {
  verifiableCredential: exampleCredentialTwo,
  metadata: exampleCredentialMetadataTwo,
};

export const exampleCryptkeeperCredentialStringTwo = serializeCryptkeeperVC(exampleCryptkeeperCredentialTwo);

export const credentialsMap = new Map<string, string>();
credentialsMap.set(exampleCredentialHash, exampleCryptkeeperCredentialString);
credentialsMap.set(exampleCredentialHashTwo, exampleCryptkeeperCredentialStringTwo);

export const credentialsStorageString = JSON.stringify(Array.from(credentialsMap));

export const exampleVerifiablePresentationRequest: IVerifiablePresentationRequest = {
  request: "example request",
};

export const exampleVerifiablePresentation: IVerifiablePresentation = {
  context: ["https://www.w3.org/2018/credentials/v1"],
  type: ["VerifiablePresentation"],
  verifiableCredential: [exampleCredential],
};

export const defaultMetadata = {
  urlOrigin: "http://localhost:3000",
};

export const defaultTabs = [{ id: 1, url: defaultMetadata.urlOrigin }];

export const defaultPopupTab = { id: 1, active: true, highlighted: true };
