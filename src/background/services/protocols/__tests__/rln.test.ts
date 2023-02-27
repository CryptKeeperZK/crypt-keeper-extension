import { Identity } from "@semaphore-protocol/identity";
import nock from "nock";
import { RLN } from "rlnjs";

import ZkIdentityDecorater from "@src/background/identityDecorater";
import { ZERO_ADDRESS } from "@src/config/const";
import { IdentityMetadata } from "@src/types";
import { RLNProofRequest } from "../interfaces";

import RLNService from "../rln";

jest.mock("rlnjs");

describe("background/services/protocols/rln", () => {
  const defaultIdentity = new Identity("1234");

  const defaultIdentityMetadata: IdentityMetadata = {
    account: ZERO_ADDRESS,
    name: "Identity #1",
    identityStrategy: "interrep",
    web2Provider: "twitter",
  };

  const proofRequest: RLNProofRequest = {
    externalNullifier: "externalNullifier",
    signal: "0x0",
    circuitFilePath: "circuitFilePath",
    verificationKey: "verificationKey",
    zkeyFilePath: "zkeyFilePath",
    rlnIdentifier: "rlnIdentifier",
  };

  const identityDecorater = new ZkIdentityDecorater(defaultIdentity, defaultIdentityMetadata);

  test("should generate rln proof properly with remote merkle proof", async () => {
    nock("http://localhost:3000")
      .post("/merkle")
      .reply(200, {
        data: {
          merkleProof: {
            root: "0",
            leaf: "1",
            siblings: [],
            pathIndices: [],
          },
        },
      });
    const rln = new RLNService();

    await rln.genProof(identityDecorater, { ...proofRequest, merkleStorageAddress: "http://localhost:3000/merkle" });
    const [rlnInstance] = (RLN as jest.Mock).mock.instances;

    expect(rlnInstance.generateProof).toBeCalledTimes(1);
    expect(rlnInstance.generateProof).toBeCalledWith(
      proofRequest.signal,
      {
        root: 0n,
        leaf: 1n,
        siblings: [],
        pathIndices: [],
      },
      proofRequest.externalNullifier,
    );
  });

  test("should handle error properly when generating rln proof", async () => {
    nock("http://localhost:3000").post("/merkle").replyWithError("error");
    const rln = new RLNService();

    const promise = rln.genProof(identityDecorater, {
      ...proofRequest,
      merkleStorageAddress: "http://localhost:3000/merkle",
    });

    await expect(promise).rejects.toThrowError(
      "Error while generating RLN proof: FetchError: request to http://localhost:3000/merkle failed, reason: error",
    );
  });

  test("should generate rln proof properly with provided merkle root", async () => {
    const rln = new RLNService();

    await rln.genProof(identityDecorater, {
      ...proofRequest,
      merkleProofArtifacts: { depth: 20, leavesPerNode: 1, leaves: [] },
    });
    const [rlnInstance] = (RLN as jest.Mock).mock.instances;

    expect(rlnInstance.generateProof).toBeCalledTimes(1);
    expect(rlnInstance.generateProof).toBeCalledWith(
      proofRequest.signal,
      {
        root: 0n,
        leaf: 1n,
        siblings: [],
        pathIndices: [],
      },
      proofRequest.externalNullifier,
    );
  });
});
