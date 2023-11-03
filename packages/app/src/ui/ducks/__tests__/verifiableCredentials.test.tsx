/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { RPCInternalAction } from "@src/constants";
import { store } from "@src/ui/store/configureAppStore";
import { serializeCryptkeeperVC } from "@src/util/credentials";
import postMessage from "@src/util/postMessage";

import {
  addVC,
  renameVC,
  deleteVC,
  useVCs,
  fetchVCs,
  generateVP,
  generateVPWithCryptkeeper,
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
    serializeCryptkeeperVC(mockCryptkeeperVerifiableCredentials[0]),
    serializeCryptkeeperVC(mockCryptkeeperVerifiableCredentials[1]),
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch verifiable credentials properly", async () => {
    (postMessage as jest.Mock).mockResolvedValueOnce(mockCryptkeeperVerifiableCredentials);

    await Promise.resolve(store.dispatch(fetchVCs()));
    const { verifiableCredentials } = store.getState();

    const serializedVerifiableCredentialHookData = renderHook(() => useVCs(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(verifiableCredentials.serializedVCs).toStrictEqual(mockSerializedVerifiableCredentials);
    expect(serializedVerifiableCredentialHookData.result.current).toStrictEqual(mockSerializedVerifiableCredentials);
  });

  test("should add verifiable credential properly", async () => {
    const mockSerializedVerifiableCredential = "cred";
    const mockName = "name";

    await Promise.resolve(store.dispatch(addVC(mockSerializedVerifiableCredential, mockName, "urlOrigin")));

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.ADD_VERIFIABLE_CREDENTIAL,
      payload: {
        serialized: mockSerializedVerifiableCredential,
        name: mockName,
      },
      meta: {
        urlOrigin: "urlOrigin",
      },
    });
  });

  test("should rename verifiable credential properly", async () => {
    const mockPayload = { hash: "hash", name: "name" };

    await Promise.resolve(store.dispatch(renameVC(mockPayload)));

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.RENAME_VERIFIABLE_CREDENTIAL,
      payload: mockPayload,
    });
  });

  test("should delete verifiable credential properly", async () => {
    const mockHash = "hash";

    await Promise.resolve(store.dispatch(deleteVC(mockHash)));

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.DELETE_VERIFIABLE_CREDENTIAL,
      payload: mockHash,
    });
  });

  test("should generate verfifiable presentation properly", async () => {
    await Promise.resolve(store.dispatch(generateVP(mockVerifiablePresentation, "urlOrigin")));

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.GENERATE_VERIFIABLE_PRESENTATION,
      payload: mockVerifiablePresentation,
      meta: {
        urlOrigin: "urlOrigin",
      },
    });
  });

  test("should generate verifiable presentation with cryptkeeper properly", async () => {
    const mockAddress = "0x123";
    await Promise.resolve(
      store.dispatch(
        generateVPWithCryptkeeper(
          {
            verifiablePresentation: mockVerifiablePresentation,
            address: mockAddress,
          },
          "urlOrigin",
        ),
      ),
    );

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.GENERATE_VERIFIABLE_PRESENTATION_WITH_CRYPTKEEPER,
      payload: { verifiablePresentation: mockVerifiablePresentation, address: mockAddress },
      meta: {
        urlOrigin: "urlOrigin",
      },
    });
  });
});
