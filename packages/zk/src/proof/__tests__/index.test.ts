import {
  ZkProofService,
  deserializeMerkleProof,
  generateMerkleProof,
  getMerkleProof,
  getRlnVerificationKeyJson,
  SemaphoreProofService,
  RLNProofService,
} from "../index";

describe("Proof Index Module", () => {
  it("should export ZkProofService", () => {
    expect(ZkProofService).toBeDefined();
  });

  it("should export deserializeMerkleProof", () => {
    expect(deserializeMerkleProof).toBeDefined();
  });

  it("should export generateMerkleProof", () => {
    expect(generateMerkleProof).toBeDefined();
  });

  it("should export getMerkleProof", () => {
    expect(getMerkleProof).toBeDefined();
  });

  it("should export getRlnVerificationKeyJson", () => {
    expect(getRlnVerificationKeyJson).toBeDefined();
  });

  it("should export SemaphoreProofService", () => {
    expect(SemaphoreProofService).toBeDefined();
  });

  it("should export RLNProofService", () => {
    expect(RLNProofService).toBeDefined();
  });
});
