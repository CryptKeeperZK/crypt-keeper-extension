import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const addVerifiableCredential = async (): Promise<void> => {
  const mockVerifiableCredential = {
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
  }; // Example

  const verifiableCredentialJson = JSON.stringify(mockVerifiableCredential);

  await client?.request({
    method: RPCExternalAction.ADD_VERIFIABLE_CREDENTIAL,
    payload: verifiableCredentialJson,
  });
};

export { addVerifiableCredential };
