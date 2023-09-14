/**
 * @jest-environment jsdom
 */

import { RPCAction } from "@cryptkeeperzk/providers";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { serializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import {
  addVerifiableCredential,
  rejectVerifiableCredentialRequest,
  renameVerifiableCredential,
  deleteVerifiableCredential,
  useVerifiableCredentials,
  fetchVerifiableCredentials,
  generateVerifiablePresentation,
  generateVerifiablePresentationWithCryptkeeper,
  rejectVerifiablePresentationRequest,
} from "../verifiableCredentials";

jest.unmock("@src/ui/ducks/hooks");

describe("ui/ducks/verifiableCredentials", () => {
  const mockVerifiableCredentialOne = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    id: "http://example.edu/credentials/3732",
    type: ["VerifiableCredential"],
    issuer: "did:example:123",
    issuanceDate: new Date("2020-03-10T04:24:12.164Z"),
    credentialSubject: {
      id: "did:example:456",
      claims: {
        type: "BachelorDegree",
        name: "Bachelor of Science and Arts",
      },
    },
  };
  const mockVerifiableCredentialTwo = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    id: "http://example.edu/credentials/3733",
    type: ["VerifiableCredential"],
    issuer: "did:example:12345",
    issuanceDate: new Date("2020-03-10T04:24:12.164Z"),
    credentialSubject: {
      id: "did:example:123",
      claims: {
        type: "BachelorDegree",
        name: "Bachelor of Science and Arts",
      },
    },
  };
  const mockCryptkeeperVerifiableCredentials = [
    {
      verifiableCredential: mockVerifiableCredentialOne,
      metadata: {
        hash: "0x123",
        name: "Credential #0",
      },
    },
    {
      verifiableCredential: mockVerifiableCredentialTwo,
      metadata: {
        hash: "0x1234",
        name: "Credential #1",
      },
    },
  ];

  const mockVerifiablePresentation = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiablePresentation"],
    verifiableCredential: [mockVerifiableCredentialOne, mockVerifiableCredentialTwo],
  };

  const mockSerializedVerifiableCredentials = [
    serializeCryptkeeperVerifiableCredential(mockCryptkeeperVerifiableCredentials[0]),
    serializeCryptkeeperVerifiableCredential(mockCryptkeeperVerifiableCredentials[1]),
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch verifiable credentials properly", async () => {
    (postMessage as jest.Mock).mockResolvedValueOnce(mockCryptkeeperVerifiableCredentials);

    await Promise.resolve(store.dispatch(fetchVerifiableCredentials()));
    const { verifiableCredentials } = store.getState();

    const serializedVerifiableCredentialHookData = renderHook(() => useVerifiableCredentials(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(verifiableCredentials.serializedVerifiableCredentials).toStrictEqual(mockSerializedVerifiableCredentials);
    expect(serializedVerifiableCredentialHookData.result.current).toStrictEqual(mockSerializedVerifiableCredentials);
  });

  test("should add verifiable credential properly", async () => {
    const mockSerializedVerifiableCredential = "cred";
    const mockName = "name";

    await Promise.resolve(store.dispatch(addVerifiableCredential(mockSerializedVerifiableCredential, mockName)));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.ADD_VERIFIABLE_CREDENTIAL,
      payload: {
        serializedVerifiableCredential: mockSerializedVerifiableCredential,
        verifiableCredentialName: mockName,
      },
    });
  });

  test("should reject verifiable credential request properly", async () => {
    await Promise.resolve(store.dispatch(rejectVerifiableCredentialRequest()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.REJECT_VERIFIABLE_CREDENTIAL_REQUEST,
    });
  });

  test("should rename verifiable credential properly", async () => {
    const mockPayload = { verifiableCredentialHash: "hash", newVerifiableCredentialName: "name" };

    await Promise.resolve(store.dispatch(renameVerifiableCredential(mockPayload)));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.RENAME_VERIFIABLE_CREDENTIAL,
      payload: mockPayload,
    });
  });

  test("should delete verifiable credential properly", async () => {
    const mockHash = "hash";

    await Promise.resolve(store.dispatch(deleteVerifiableCredential(mockHash)));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.DELETE_VERIFIABLE_CREDENTIAL,
      payload: mockHash,
    });
  });

  test("should generate verfifiable presentation properly", async () => {
    await Promise.resolve(store.dispatch(generateVerifiablePresentation(mockVerifiablePresentation)));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.GENERATE_VERIFIABLE_PRESENTATION,
      payload: mockVerifiablePresentation,
    });
  });

  test("should generate verifiable presentation with cryptkeeper properly", async () => {
    const mockAddress = "0x123";
    await Promise.resolve(
      store.dispatch(
        generateVerifiablePresentationWithCryptkeeper({
          verifiablePresentation: mockVerifiablePresentation,
          address: mockAddress,
        }),
      ),
    );

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.GENERATE_VERIFIABLE_PRESENTATION_WITH_CRYPTKEEPER,
      payload: { verifiablePresentation: mockVerifiablePresentation, address: mockAddress },
    });
  });

  test("should reject a verfifiable presentation request properly", async () => {
    await Promise.resolve(store.dispatch(rejectVerifiablePresentationRequest()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.REJECT_VERIFIABLE_PRESENTATION_REQUEST,
    });
  });
});
