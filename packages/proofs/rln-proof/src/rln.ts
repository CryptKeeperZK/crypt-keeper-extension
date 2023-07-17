import { Identity } from '@semaphore-protocol/identity'
import { VerificationKey } from './types'
import { DEFAULT_MERKLE_TREE_DEPTH, calculateIdentityCommitment, calculateSignalHash } from './common'
import { IRLNRegistry, ContractRLNRegistry } from './registry'
import { MemoryCache, EvaluatedProof, ICache, Status } from './cache'
import { IMessageIDCounter, MemoryMessageIDCounter } from './message-id-counter'
import { RLNFullProof, RLNProver, RLNVerifier } from './circuit-wrapper'
import { ethers } from 'ethers'
import { RLNContract } from './contract-wrapper'

import { defaultWithdrawParams, treeDepthToDefaultRLNParams } from './resources'

// Ref: https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/55c7da2227b501175076bf73e3ff6dc512c4c813/circuits/rln.circom#L40
const LIMIT_BIT_SIZE = 16
const MAX_MESSAGE_LIMIT = (BigInt(1) << BigInt(LIMIT_BIT_SIZE)) - BigInt(1)

export interface IRLN {
  /* Membership */
  /**
   * Register the user to the registry.
   * @param userMessageLimit The message limit of the user.
   * @param messageIDCounter The messageIDCounter is used to **safely** generate the latest messageID for the user.
   * If not provided, a new `MemoryMessageIDCounter` is created.
   */
  register(userMessageLimit: bigint, messageIDCounter?: IMessageIDCounter): Promise<void>
  /**
   * Withdraw the user from the registry.
   */
  withdraw(): Promise<void>
  /**
   * Slash the user with the given secret.
   * @param secretToBeSlashed The secret to be slashed.
   * @param receiver The address of the slash reward receiver. If not provided,
   * the signer will receive the reward.
   */
  slash(secretToBeSlashed: bigint, receiver?: string): Promise<void>

  /* Proof-related */
  /**
   * Create a proof for the given epoch and message.
   * @param epoch the timestamp of the message
   * @param message the message to be proved
   */
  createProof(epoch: bigint, message: string): Promise<RLNFullProof>
  /**
   * Verify a RLNFullProof
   * @param epoch the timestamp of the message
   * @param message the message to be proved
   * @param proof the RLNFullProof to be verified
   */
  verifyProof(epoch: bigint, message: string, proof: RLNFullProof): Promise<boolean>
  /**
   * Save a proof to the cache and check if it's a spam.
   * @param proof the RLNFullProof to save and detect spam
   * @returns result of the check. It could be VALID if the proof hasn't been seen,
   * or DUPLICATE if the proof has been seen before, else BREACH means it could be spam.
   */
  saveProof(proof: RLNFullProof): Promise<EvaluatedProof>
}

/**
 * RLN handles all operations for a RLN user, including registering, withdrawing, creating proof, verifying proof.
 */
export class RLN implements IRLN {
  // the unique identifier of the app using RLN
  readonly rlnIdentifier: bigint

  // the semaphore identity of the user
  readonly identity: Identity

  // the prover allows user to generate proof with the RLN circuit
  private prover?: RLNProver

  // the verifier allows user to verify proof with the RLN circuit
  private verifier?: RLNVerifier

  // the registry that stores the registered users
  private registry: IRLNRegistry

  // the cache that stores proofs added by the user with `addProof`, and detect spams automatically
  private cache: ICache

  // the messageIDCounter is used to **safely** generate the latest messageID for the user
  public messageIDCounter?: IMessageIDCounter

  constructor(args: {
    /** Required */
    /**
     * The unique identifier of the app using RLN. The identifier must be unique for every app.
     */
    rlnIdentifier: bigint
    /**
     * `IRegistry` that stores the registered users. If not provided, a new `ContractRLNRegistry` is created.
     * @see {@link ContractRLNRegistry}
     */
    registry: IRLNRegistry

    /** Optional */
    /**
     * Semaphore identity of the user. If not provided, a new `Identity` is created.
     */
    identity?: Identity
    /**
     * Tree depth of the merkle tree used by the circuit. If not provided, the default value will be used.
     * @default 20
     */
    treeDepth?: number
    /**
     * The maximum number of epochs that the cache can store. If not provided, the default value will be used.
     * This is only used when `cache` is not provided.
     * @default 100
     * @see {@link MemoryCache}
     */
    cacheSize?: number
    /**
     * `ICache` that stores proofs added by the user with `addProof`, and detect spams automatically.
     * If not provided, a new `MemoryCache` is created.
     * @see {@link MemoryCache}
     */
    cache?: ICache

    // File paths of the wasm and zkey file. If not provided, `createProof` will not work.
    /**
     * File path of the RLN wasm file. If not provided, `createProof` will not work.
     * @see {@link https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/main/circuits/rln.circom}
     */
    wasmFilePath?: string | Uint8Array
    /**
     * File path of the RLN final zkey file. If not provided, `createProof` will not work.
     * @see {@link https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/main/circuits/rln.circom}
     */
    finalZkeyPath?: string | Uint8Array
    // Verification key of the circuit. If not provided, `verifyProof` and `saveProof` will not work.
    /**
     * Verification key of the RLN circuit. If not provided, `verifyProof` and `saveProof` will not work.
     * @see {@link https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/main/circuits/rln.circom}
     */
    verificationKey?: VerificationKey
  }) {
    if (args.rlnIdentifier < 0) {
      throw new Error('rlnIdentifier must be positive')
    }
    if (args.treeDepth !== undefined && args.treeDepth <= 0) {
      throw new Error('treeDepth must be positive')
    }
    if (args.cacheSize !== undefined && args.cacheSize <= 0) {
      throw new Error('cacheSize must be positive')
    }

    this.rlnIdentifier = args.rlnIdentifier
    this.registry = args.registry
    this.cache = args.cache ? args.cache : new MemoryCache(args.cacheSize)
    this.identity = args.identity ? args.identity : new Identity()

    // 3. Else, leave them undefined
    let wasmFilePath: string | Uint8Array | undefined
    let finalZkeyPath: string | Uint8Array | undefined
    let verificationKey: VerificationKey | undefined

    const treeDepth = args.treeDepth ? args.treeDepth : DEFAULT_MERKLE_TREE_DEPTH
    // If `args.treeDepth` is given, `wasmFilePath`, `finalZkeyPath`, and `verificationKey` will be
    // set to default first
    if (treeDepth !== undefined) {
      const defaultParams = treeDepthToDefaultRLNParams[treeDepth]
      if (defaultParams !== undefined) {
        wasmFilePath = defaultParams.wasmFile
        finalZkeyPath = defaultParams.finalZkey
        verificationKey = defaultParams.verificationKey
      }
    }
    // If `args.wasmFilePath`, `args.finalZkeyPath`, and `args.verificationKey` are given, use them
    // over the default
    wasmFilePath = args.wasmFilePath ? args.wasmFilePath : wasmFilePath
    finalZkeyPath = args.finalZkeyPath ? args.finalZkeyPath : finalZkeyPath
    verificationKey = args.verificationKey ? args.verificationKey : verificationKey

    if ((wasmFilePath === undefined || finalZkeyPath === undefined) && verificationKey === undefined) {
      throw new Error(
        'Either both `wasmFilePath` and `finalZkeyPath` must be supplied to generate proofs, ' +
        'or `verificationKey` must be provided to verify proofs.',
      )
    }
    if (wasmFilePath !== undefined && finalZkeyPath !== undefined) {
      this.prover = new RLNProver(wasmFilePath, finalZkeyPath)
    }
    if (verificationKey !== undefined) {
      this.verifier = new RLNVerifier(verificationKey)
    }
  }

  /**
   * Create RLN instance, using a deployed RLN contract as registry.
   */
  static createWithContractRegistry(args: {
    /** Required */
    /**
     * The unique identifier of the app using RLN. The identifier must be unique for every app.
     */
    rlnIdentifier: bigint
    /**
     * The ethers provider that is used to interact with the RLN contract.
     * @see {@link https://docs.ethers.io/v5/api/providers/}
     */
    provider: ethers.Provider
    /**
     * The address of the RLN contract.
     */
    contractAddress: string

    /** Optional */
    /**
     * The ethers signer that is used to interact with the RLN contract. If not provided,
     * user can only do read-only operations. Functions like `register` and `withdraw` will not work
     * since they need to send transactions to interact with the RLN contract.
     * @see {@link https://docs.ethers.io/v5/api/signer/#Signer}
     */
    signer?: ethers.Signer,
    /**
     * The block number where the RLN contract is deployed. If not provided, `0` will be used.
     * @default 0
     * @see {@link https://docs.ethers.io/v5/api/providers/provider/#Provider-getLogs}
     */
    contractAtBlock?: number,
    /**
     * Semaphore identity of the user. If not provided, a new `Identity` is created.
     */
    identity?: Identity
    // File paths of the wasm and zkey file. If not provided, `createProof` will not work.
    /**
     * File path of the RLN wasm file. If not provided, `createProof` will not work.
     * @see {@link https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/main/circuits/rln.circom}
     */
    wasmFilePath?: string | Uint8Array
    /**
     * File path of the RLN final zkey file. If not provided, `createProof` will not work.
     * @see {@link https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/main/circuits/rln.circom}
     */
    finalZkeyPath?: string | Uint8Array
    // Verification key of the circuit. If not provided, `verifyProof` and `saveProof` will not work.
    /**
     * Verification key of the RLN circuit. If not provided, `verifyProof` and `saveProof` will not work.
     * @see {@link https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/main/circuits/rln.circom}
     */
    verificationKey?: VerificationKey
    /**
     * Tree depth of the merkle tree used by the circuit. If not provided, the default value will be used.
     * @default 20
     */
    treeDepth?: number

    /* Registry configs */
    /**
     * File path of the wasm file for withdraw circuit. If not provided, `withdraw` will not work.
     * @see {@link https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/main/circuits/withdraw.circom}
     */
    withdrawWasmFilePath?: string | Uint8Array,
    /**
     * File path of the final zkey file for withdraw circuit. If not provided, `withdraw` will not work.
     * @see {@link https://github.com/Rate-Limiting-Nullifier/circom-rln/blob/main/circuits/withdraw.circom}
     */
    withdrawFinalZkeyPath?: string | Uint8Array,

    /** Others */
    /**
     * `ICache` that stores proofs added by the user with `addProof`, and detect spams automatically.
     * If not provided, a new `MemoryCache` is created.
     * @see {@link MemoryCache}
     */
    cache?: ICache
    /**
     * The maximum number of epochs that the cache can store. If not provided, the default value will be used.
     * This is only used when `cache` is not provided.
     * @default 100
     * @see {@link MemoryCache}
     */
    cacheSize?: number
  }) {
    const rlnContractWrapper = new RLNContract({
      provider: args.provider,
      signer: args.signer,
      contractAddress: args.contractAddress,
      contractAtBlock: args.contractAtBlock ? args.contractAtBlock : 0,
    })
    const treeDepth = args.treeDepth ? args.treeDepth : DEFAULT_MERKLE_TREE_DEPTH

    // If `args.withdrawWasmFilePath`, `args.withdrawFinalZkeyPath` are given, use them
    // over the default
    const withdrawWasmFilePath = args.withdrawWasmFilePath ? args.withdrawWasmFilePath : defaultWithdrawParams.wasmFile
    const withdrawFinalZkeyPath = args.withdrawFinalZkeyPath ? args.withdrawFinalZkeyPath : defaultWithdrawParams.finalZkey
    const registry = new ContractRLNRegistry({
      rlnIdentifier: args.rlnIdentifier,
      rlnContract: rlnContractWrapper,
      treeDepth,
      withdrawWasmFilePath: withdrawWasmFilePath,
      withdrawFinalZkeyPath: withdrawFinalZkeyPath,
    })
    const argsWithRegistry = {
      ...args,
      registry,
    }
    return new RLN(argsWithRegistry)
  }

  /**
   * Set a custom messageIDCounter
   * @param messageIDCounter The custom messageIDCounter
   */
  async setMessageIDCounter(messageIDCounter?: IMessageIDCounter) {
    if (await this.isRegistered() === false) {
      throw new Error('Cannot set messageIDCounter for an unregistered user.')
    }
    if (messageIDCounter !== undefined) {
      this.messageIDCounter = messageIDCounter
    } else {
      const userMessageLimit = await this.registry.getMessageLimit(this.identityCommitment)
      this.messageIDCounter = new MemoryMessageIDCounter(userMessageLimit)
    }
  }

  /**
   * Set a custom cache
   * @param cache The custom cache
   */
  setCache(cache: ICache) {
    this.cache = cache
  }

  /**
   * Set a custom registry
   * @param registry The custom registry
   */
  setRegistry(registry: IRLNRegistry) {
    this.registry = registry
  }

  /**
   * Get the latest merkle root of the registry.
   * @returns the latest merkle root of the registry
   */
  async getMerkleRoot(): Promise<bigint> {
    return this.registry.getMerkleRoot()
  }

  /**
   * Get the identity commitment of the user.
   */
  get identityCommitment(): bigint {
    return this.identity.commitment
  }

  private get identitySecret(): bigint {
    return calculateIdentityCommitment(this.identity)
  }

  /**
   * Get the rate commitment of the user, i.e. hash(identitySecret, messageLimit)
   * @returns the rate commitment
   */
  async getRateCommitment(): Promise<bigint> {
    return this.registry.getRateCommitment(this.identityCommitment)
  }

  /**
   * @returns the user has been registered or not
   */
  async isRegistered(): Promise<boolean> {
    return this.registry.isRegistered(this.identityCommitment)
  }

  /**
   * @returns all rate commitments in the registry
   */
  async getAllRateCommitments(): Promise<bigint[]> {
    return this.registry.getAllRateCommitments()
  }

  /**
   * User registers to the registry.
   * @param userMessageLimit the maximum number of messages that the user can send in one epoch
   * @param messageIDCounter the messageIDCounter that the user wants to use. If not provided, a new `MemoryMessageIDCounter` is created.
   */
  async register(userMessageLimit: bigint, messageIDCounter?: IMessageIDCounter) {
    if (userMessageLimit <= BigInt(0) || userMessageLimit > MAX_MESSAGE_LIMIT) {
      throw new Error(
        `userMessageLimit must be in range (0, ${MAX_MESSAGE_LIMIT}]. Got ${userMessageLimit}.`,
      )
    }
    await this.registry.register(this.identityCommitment, userMessageLimit)
    this.messageIDCounter = messageIDCounter ? messageIDCounter : new MemoryMessageIDCounter(userMessageLimit)
  }

  /**
   * User withdraws from the registry. User will not receive the funds immediately,
   * they need to wait `freezePeriod + 1` blocks and call `releaseWithdrawal` to get the funds.
   */
  async withdraw() {
    await this.registry.withdraw(this.identitySecret)
  }

  /**
   * Release the funds from the pending withdrawal requested by `withdraw`.
   */
  async releaseWithdrawal() {
    await this.registry.releaseWithdrawal(this.identityCommitment)
    this.messageIDCounter = undefined
  }

  /**
   * Slash a user by its identity secret.
   * @param secretToBeSlashed the identity secret of the user to be slashed
   * @param receiver the receiver of the slashed funds. If not provided, the funds will be sent to
   * the `signer` given in the constructor.
   */
  async slash(secretToBeSlashed: bigint, receiver?: string) {
    await this.registry.slash(secretToBeSlashed, receiver)
  }

  /**
   * Create a proof for the given epoch and message.
   * @param epoch the epoch to create the proof for
   * @param message the message to create the proof for
   * @returns the RLNFullProof
   */
  async createProof(epoch: bigint, message: string): Promise<RLNFullProof> {
    if (epoch < 0) {
      throw new Error('epoch cannot be negative')
    }
    if (this.prover === undefined) {
      throw new Error('Prover is not initialized')

    }
    if (!await this.isRegistered()) {
      throw new Error('User has not registered before')
    }
    if (this.messageIDCounter === undefined) {
      throw new Error(
        'State is not synced with the registry. ' +
        'If user is currently registered, `messageIDCounter` should be non-undefined',
      )
    }
    const merkleProof = await this.registry.generateMerkleProof(this.identityCommitment)
    // NOTE: get the message id and increment the counter.
    // Even if the message is not sent, the counter is still incremented.
    // It's intended to avoid any possibly for user to reuse the same message id.
    const messageId = await this.messageIDCounter.getMessageIDAndIncrement(epoch)
    const userMessageLimit = await this.registry.getMessageLimit(this.identityCommitment)
    const proof = await this.prover.generateProof({
      rlnIdentifier: this.rlnIdentifier,
      identitySecret: this.identitySecret,
      userMessageLimit: userMessageLimit,
      messageId,
      merkleProof,
      x: calculateSignalHash(message),
      epoch,
    })
    // Double check if the proof will spam or not using the cache.
    // Even if messageIDCounter is used, it is possible that the user restart and the counter is reset.
    const res = await this.checkProof(proof)
    if (res.status === Status.DUPLICATE) {
      throw new Error('Proof has been generated before')
    } else if (res.status === Status.BREACH) {
      throw new Error('Proof will spam')
    } else if (res.status === Status.VALID) {
      const resSaveProof = await this.saveProof(proof)
      if (resSaveProof.status !== res.status) {
        // Sanity check
        throw new Error('Status of save proof and check proof mismatch')
      }
      return proof
    } else {
      // Sanity check
      throw new Error('Unknown status')
    }
  }

  /**
   * Verify a proof is valid and indeed for `epoch` and `message`.
   * @param epoch the epoch to verify the proof for
   * @param message the message to verify the proof for
   * @param proof the RLNFullProof to verify
   * @returns true if the proof is valid, false otherwise
   */
  async verifyProof(epoch: bigint, message: string, proof: RLNFullProof): Promise<boolean> {
    if (epoch < BigInt(0)) {
      throw new Error('epoch cannot be negative')
    }
    if (this.verifier === undefined) {
      throw new Error('Verifier is not initialized')
    }
    // Check if the proof is using the same parameters
    const snarkProof = proof.snarkProof
    const epochInProof = proof.epoch
    const rlnIdentifier = proof.rlnIdentifier
    const { root, x } = snarkProof.publicSignals
    // Check if the proof is using the same rlnIdentifier
    if (BigInt(rlnIdentifier) !== this.rlnIdentifier) {
      return false
    }
    // Check if the proof is using the same epoch
    if (BigInt(epochInProof) !== epoch) {
      return false
    }
    // Check if the proof and message match
    const messageToX = calculateSignalHash(message)
    if (BigInt(x) !== messageToX) {
      return false
    }
    // Check if the merkle root is the same as the registry's
    const registryMerkleRoot = await this.registry.getMerkleRoot()
    if (BigInt(root) !== registryMerkleRoot) {
      return false
    }
    // Verify snark proof
    return this.verifier.verifyProof(rlnIdentifier, proof)
  }

  /**
   * Save a proof to the cache and check if it's a spam.
   * @param proof the RLNFullProof to save and detect spam
   * @returns result of the check. `status` could be status.VALID if the proof is not a spam or invalid.
   * Otherwise, it will be status.DUPLICATE or status.BREACH.
   */
  async saveProof(proof: RLNFullProof): Promise<EvaluatedProof> {
    const { snarkProof, epoch } = proof
    const { x, y, nullifier } = snarkProof.publicSignals
    return this.cache.addProof({ x, y, nullifier, epoch })
  }

  private async checkProof(proof: RLNFullProof): Promise<EvaluatedProof> {
    const { snarkProof, epoch } = proof
    const { x, y, nullifier } = snarkProof.publicSignals
    return this.cache.checkProof({ x, y, nullifier, epoch })
  }

  /**
   * Clean up the worker threads used by the prover and verifier in snarkjs
   * This function should be called when the user is done with the library
   * and wants to clean up the worker threads.
   *
   * Ref: https://github.com/iden3/snarkjs/issues/152#issuecomment-1164821515
   */
  static cleanUp() {
    // @ts-ignore 
    // TODO: error TS7017: Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.
    globalThis.curve_bn128.terminate()
  }
}
