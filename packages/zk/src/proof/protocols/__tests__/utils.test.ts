import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { poseidon1 } from "poseidon-lite/poseidon1";
import { poseidon2 } from "poseidon-lite/poseidon2";

import {
  deserializeMerkleProof,
  generateMerkleProof,
  getMerkleProof,
  getMessageHash,
  getRateCommitmentHash,
  getRlnVerificationKeyJson,
  str2BigInt,
} from "../..";
import { calculateIdentitySecret, calculateIdentityCommitment } from "../utils";

describe("background/services/protocols/utils", () => {
  const defaultMerkleProof: MerkleProof = {
    root: 0n,
    leaf: 1n,
    siblings: [[0n, 1n, 2n], 3n, 4n],
    pathIndices: [0, 1, 2, 3],
  };

  const defaultDeserializedMerkleProof = {
    root: "0",
    leaf: "1",
    siblings: [["0", "1", "2"], "3", "4"],
    pathIndices: [0, 1, 2, 3],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should deserialize merkle proof properly", () => {
    const deserialized = deserializeMerkleProof(defaultDeserializedMerkleProof);

    expect(deserialized).toStrictEqual(defaultMerkleProof);
  });

  test("should generate merkle proof properly", () => {
    const identity = new Identity();
    const merkleProof = generateMerkleProof({
      treeDepth: 2,
      member: identity.getCommitment(),
      members: [identity.getCommitment()],
    });

    expect(merkleProof.root).toBeDefined();
    expect(merkleProof.leaf).toBeDefined();
    expect(merkleProof.pathIndices).not.toHaveLength(0);
    expect(merkleProof.siblings).not.toHaveLength(0);
  });

  test("should get merkle proof from remote url origin properly", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ data: { merkleProof: defaultDeserializedMerkleProof } }),
    } as Response);

    const identity = new Identity();

    const result = await getMerkleProof({
      identityCommitment: identity.getCommitment(),
      merkleStorageUrl: "http://localhost:3000/merkle",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(defaultMerkleProof);
  });

  test("should throw error if can't get merkle proof from remote urlOrigin", async () => {
    const error = new Error("error");
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.reject(error),
    } as Response);

    const identity = new Identity();

    await expect(
      getMerkleProof({
        identityCommitment: identity.getCommitment(),
        merkleStorageUrl: "http://localhost:3000/merkle",
      }),
    ).rejects.toThrowError(`Error in fetching Mock Merkle Proof ${error.message}`);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("should get merkle proof from artifact properly", async () => {
    const identity = new Identity();

    const result = await getMerkleProof({
      identityCommitment: identity.getCommitment(),
      merkleProofArtifacts: { depth: 20, leavesPerNode: 1, leaves: [] },
    });

    expect(result).toBeDefined();
  });

  test("should throw error if there is no enough params for getting merkle proof", async () => {
    const identity = new Identity();

    await expect(
      getMerkleProof({
        identityCommitment: identity.getCommitment(),
      }),
    ).rejects.toThrowError("ZK: Cannot get MerkleProof");
  });

  test("should get rln verification key proof from remote url origin properly", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ data: {} }),
    } as Response);

    const result = await getRlnVerificationKeyJson("path");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({ data: {} });
  });

  test("should convert string to bigint", () => {
    const string = "1234";
    const bigint = str2BigInt(string);

    expect(bigint).toBeDefined();
    expect(typeof bigint).toStrictEqual("bigint");
  });

  test("should hash a string using poseidon1 hash function", () => {
    const message = "1234";
    const bigintMessage = str2BigInt(message);
    const expectedMessageHash = poseidon1([bigintMessage]);
    const actualMessageHash = getMessageHash(message);

    expect(actualMessageHash).toBeDefined();
    expect(typeof actualMessageHash).toStrictEqual("bigint");
    expect(expectedMessageHash).toStrictEqual(actualMessageHash);
  });

  test("should calculate the rate commitment of hash", () => {
    const identityCommitment = 1n;
    const userMessageLimit = 1;
    const expectedCommitmentHash = poseidon2([identityCommitment, userMessageLimit]);
    const actualCommitmentHash = getRateCommitmentHash(identityCommitment, userMessageLimit);

    expect(actualCommitmentHash).toBeDefined();
    expect(typeof actualCommitmentHash).toStrictEqual("bigint");
    expect(expectedCommitmentHash).toStrictEqual(actualCommitmentHash);
  });

  test("should calculate identity secret and commitment properly", () => {
    const secret = calculateIdentitySecret({
      nullifier: "12578821460373135693013277026392552769801800051254682675996381598033497431909",
      trapdoor: "8599172605644748803815316525430713607475871751016594621440814664229873275229",
    });
    const commitment = calculateIdentityCommitment(secret);

    expect(secret).toBe("18581243383539966831792047417781846056480615829070187698258804610596815513832");
    expect(commitment).toBe("771513069964543266361335293794342776740652616031495715975492466025590633824");
  });

  test("should not calculate identity secret and commitment if data is empty", () => {
    const secret = calculateIdentitySecret({
      nullifier: "",
      trapdoor: "",
    });
    const commitment = calculateIdentityCommitment(secret);

    expect(secret).toBe("");
    expect(commitment).toBe("");
  });
});
