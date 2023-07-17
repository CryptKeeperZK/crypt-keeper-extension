import { RLNProver, RLNVerifier, WithdrawProver, WithdrawVerifier } from '../src/circuit-wrapper';
import { rlnParams, withdrawParams } from './configs';
import { fieldFactory, generateMerkleProof } from './utils';
import poseidon from 'poseidon-lite';
import { DEFAULT_MERKLE_TREE_DEPTH } from '../src/common';

// `userMessageLimit` is at most 16 bits
// Ref: https://github.com/Rate-Limiting-Nullifier/rln-circuits-v2/blob/b40dfa63b7b1248527d7ab417d0d9cf538cad93a/circuits/utils.circom#L36-L37
const LIMIT_BIT_SIZE = 16;

describe('RLN', function () {
  const rlnIdentifier = fieldFactory();
  const rlnProver = new RLNProver(rlnParams.wasmFilePath, rlnParams.finalZkeyPath);
  const rlnVerifier = new RLNVerifier(rlnParams.verificationKey);
  const identitySecret = fieldFactory();
  const identityCommitment = poseidon([identitySecret]);
  const leaves = [identityCommitment];
  const userMessageLimit = (BigInt(1) << BigInt(LIMIT_BIT_SIZE)) - BigInt(1);
  const messageId = BigInt(0);
  const x = fieldFactory();
  const epoch = fieldFactory();
  const treeDepth = DEFAULT_MERKLE_TREE_DEPTH;

  test('should generate valid proof', async function () {
    const m0 = performance.now();
    const merkleProof = generateMerkleProof(rlnIdentifier, leaves, treeDepth, 0);
    const m1 = performance.now();
    const proof = await rlnProver.generateProof({
      rlnIdentifier,
      identitySecret,
      userMessageLimit,
      messageId,
      merkleProof,
      x,
      epoch
    });
    const m2 = performance.now();
    const isValid = await rlnVerifier.verifyProof(rlnIdentifier, proof);
    const m3 = performance.now();
    console.log(`Merkle proof generation: ${m1 - m0} ms`);
    console.log(`RLN proof generation: ${m2 - m1} ms`);
    console.log(`RLN proof verification: ${m3 - m2} ms`);
    expect(isValid).toBeTruthy();
  });
});

describe('Withdraw', function () {
  const withdrawProver = new WithdrawProver(
    withdrawParams.wasmFilePath,
    withdrawParams.finalZkeyPath
  );
  const withdrawVerifier = new WithdrawVerifier(withdrawParams.verificationKey);

  test('should generate valid proof', async function () {
    const identitySecret = fieldFactory();
    const address = fieldFactory();
    const m0 = performance.now();
    const proof = await withdrawProver.generateProof({ identitySecret, address });
    const m1 = performance.now();
    const isValid = await withdrawVerifier.verifyProof(proof);
    const m2 = performance.now();
    console.log(`Withdraw proof generation: ${m1 - m0} ms`);
    console.log(`Withdraw proof verification: ${m2 - m1} ms`);
    expect(isValid).toBeTruthy();
  });
});
