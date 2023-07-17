import { Group } from '@semaphore-protocol/group'
import { MerkleProof } from './types'
import { DEFAULT_MERKLE_TREE_DEPTH, calculateRateCommitment } from './common'
import { RLNContract } from './contract-wrapper'
import { ethers } from 'ethers'
import poseidon from 'poseidon-lite'
import { WithdrawProver } from './circuit-wrapper'

export interface IRLNRegistry {
  isRegistered(identityCommitment: bigint): Promise<boolean>
  getMerkleRoot(): Promise<bigint>
  getMessageLimit(identityCommitment: bigint): Promise<bigint>
  getRateCommitment(identityCommitment: bigint): Promise<bigint>
  getAllRateCommitments(): Promise<bigint[]>
  generateMerkleProof(identityCommitment: bigint): Promise<MerkleProof>

  register(identityCommitment: bigint, messageLimit: bigint): Promise<void>
  withdraw(identitySecret: bigint): Promise<void>
  releaseWithdrawal(identityCommitment: bigint): Promise<void>
  slash(identitySecret: bigint, receiver?: string): Promise<void>
}

export class ContractRLNRegistry implements IRLNRegistry {
  private rlnContract: RLNContract

  // the withdrawProver allows user to generate withdraw proof, which is verified in the RLN contract
  private withdrawProver?: WithdrawProver

  private rlnIdentifier: bigint

  private treeDepth: number

  constructor(args: {
    rlnIdentifier: bigint,
    rlnContract: RLNContract,
    treeDepth?: number,
    withdrawWasmFilePath?: string | Uint8Array,
    withdrawFinalZkeyPath?: string | Uint8Array,
  }) {
    this.treeDepth = args.treeDepth ? args.treeDepth : DEFAULT_MERKLE_TREE_DEPTH
    this.rlnContract = args.rlnContract
    this.rlnIdentifier = args.rlnIdentifier

    if (args.withdrawWasmFilePath !== undefined && args.withdrawFinalZkeyPath !== undefined) {
      this.withdrawProver = new WithdrawProver(args.withdrawWasmFilePath, args.withdrawFinalZkeyPath)
    }
  }

  async getSignerAddress(): Promise<string> {
    return this.rlnContract.getSignerAddress()
  }

  async isRegistered(identityCommitment: bigint): Promise<boolean> {
    return this.rlnContract.isRegistered(identityCommitment)
  }

  async getMessageLimit(identityCommitment: bigint): Promise<bigint> {
    const user = await this.rlnContract.getUser(identityCommitment)
    if (user.userAddress === ethers.ZeroAddress) {
      throw new Error('Identity commitment is not registered')
    }
    return user.messageLimit
  }

  async getRateCommitment(identityCommitment: bigint): Promise<bigint> {
    const messageLimit = await this.getMessageLimit(identityCommitment)
    return calculateRateCommitment(identityCommitment, messageLimit)
  }

  private async generateLatestGroup(): Promise<Group> {
    const group = new Group(this.rlnIdentifier, this.treeDepth)
    const events = await this.rlnContract.getLogs()
    for (const event of events) {
      if (event.name === 'MemberRegistered') {
        const identityCommitment = BigInt(event.identityCommitment)
        const messageLimit = BigInt(event.messageLimit)
        const rateCommitment = calculateRateCommitment(identityCommitment, messageLimit)
        group.addMember(rateCommitment)
      } else if (event.name === 'MemberWithdrawn' || event.name === 'MemberSlashed') {
        const index = event.index
        group.removeMember(Number(index))
      }
    }
    return group
  }

  async getAllRateCommitments(): Promise<bigint[]> {
    const group = await this.generateLatestGroup()
    return group.members.map((member) => BigInt(member))
  }

  async getMerkleRoot(): Promise<bigint> {
    const group = await this.generateLatestGroup()
    return BigInt(group.root)
  }

  /**
   * Creates a Merkle Proof.
   * @param identityCommitment The leaf for which Merkle proof should be created.
   * @returns The Merkle proof.
   */
  async generateMerkleProof(identityCommitment: bigint): Promise<MerkleProof> {
    const group = await this.generateLatestGroup()
    const user = await this.rlnContract.getUser(identityCommitment)
    if (user.userAddress === ethers.ZeroAddress) {
      throw new Error('Identity commitment is not registered')
    }
    const rateCommitment = calculateRateCommitment(identityCommitment, user.messageLimit)
    const index = group.indexOf(rateCommitment)
    if (index === -1) {
      // Should only happen when a user was registered before `const user = ...` and then withdraw/slashed
      // after `const user = ...`.
      throw new Error('Rate commitment is not in the merkle tree')
    }
    return group.generateMerkleProof(index)
  }

  async register(identityCommitment: bigint, messageLimit: bigint): Promise<void> {
    if (await this.isRegistered(identityCommitment)) {
      throw new Error('Identity commitment is already registered')
    }
    await this.rlnContract.register(identityCommitment, messageLimit)
  }

  async withdraw(identitySecret: bigint): Promise<void> {
    if (this.withdrawProver === undefined) {
      throw new Error('Withdraw prover is not initialized')
    }
    const identityCommitment = poseidon([identitySecret])
    const user = await this.rlnContract.getUser(identityCommitment)
    if (user.userAddress === ethers.ZeroAddress) {
      throw new Error('Identity commitment is not registered')
    }
    const userAddressBigInt = BigInt(user.userAddress)

    const proof = await this.withdrawProver.generateProof({
      identitySecret,
      address: userAddressBigInt,
    })
    await this.rlnContract.withdraw(identityCommitment, proof.proof)
  }

  async releaseWithdrawal(identityCommitment: bigint): Promise<void> {
    if (!await this.isRegistered(identityCommitment)) {
      throw new Error('Identity commitment is not registered')
    }
    const withdrawal = await this.rlnContract.getWithdrawal(identityCommitment)
    if (withdrawal.blockNumber == BigInt(0)) {
      throw new Error('Withdrawal is not initiated')
    }
    await this.rlnContract.release(identityCommitment)
  }

  async slash(identitySecret: bigint, receiver?: string): Promise<void> {
    if (this.withdrawProver === undefined) {
      throw new Error('Withdraw prover is not initialized')
    }
    const identityCommitment = poseidon([identitySecret])
    receiver = receiver ? receiver : await this.rlnContract.getSignerAddress()
    const receiverBigInt = BigInt(receiver)

    const proof = await this.withdrawProver.generateProof({
      identitySecret,
      address: receiverBigInt,
    })
    await this.rlnContract.slash(identityCommitment, receiver, proof.proof)
  }
}

export class MemoryRLNRegistry implements IRLNRegistry {
  // map of identityCommitment -> messageLimit
  private mapIsWithdrawing: Map<string, boolean>

  private mapMessageLimit: Map<string, bigint>

  private group: Group

  constructor(
    readonly rlnIdentifier: bigint,
    readonly treeDepth?: number | undefined,
  ) {
    this.mapIsWithdrawing = new Map<string, boolean>()
    this.mapMessageLimit = new Map<string, bigint>()
    this.group = new Group(this.rlnIdentifier, this.treeDepth)
  }

  async isRegistered(identityCommitment: bigint): Promise<boolean> {
    const messageLimit = this.mapMessageLimit.get(identityCommitment.toString())
    return messageLimit !== undefined
  }

  async getMerkleRoot(): Promise<bigint> {
    return BigInt(this.group.root)
  }

  async getMessageLimit(identityCommitment: bigint): Promise<bigint> {
    const messageLimit = this.mapMessageLimit.get(identityCommitment.toString())
    if (messageLimit === undefined) {
      throw new Error('Identity commitment is not registered')
    }
    return messageLimit
  }

  async getRateCommitment(identityCommitment: bigint): Promise<bigint> {
    const messageLimit = await this.getMessageLimit(identityCommitment)
    return calculateRateCommitment(identityCommitment, messageLimit)
  }

  async getAllRateCommitments(): Promise<bigint[]> {
    return this.group.members.map((member) => BigInt(member))
  }

  async generateMerkleProof(identityCommitment: bigint): Promise<MerkleProof> {
    const rateCommitment = await this.getRateCommitment(identityCommitment)
    const index = this.group.indexOf(rateCommitment)
    if (index === -1) {
      // Sanity check
      throw new Error('Rate commitment is not in the merkle tree. This should never happen.')
    }
    return this.group.generateMerkleProof(index)
  }

  async register(identityCommitment: bigint, messageLimit: bigint): Promise<void> {
    if (await this.isRegistered(identityCommitment)) {
      throw new Error('Identity commitment is already registered')
    }
    this.mapMessageLimit.set(identityCommitment.toString(), messageLimit)
    const rateCommitment = await this.getRateCommitment(identityCommitment)
    this.group.addMember(rateCommitment)
  }

  async withdraw(identitySecret: bigint): Promise<void> {
    const identityCommitment = poseidon([identitySecret])
    if (!await this.isRegistered(identityCommitment)) {
      throw new Error('Identity commitment is not registered')
    }
    const isWithdrawing = this.mapIsWithdrawing.get(identityCommitment.toString())
    if (isWithdrawing !== undefined) {
      throw new Error('Identity is already withdrawing')
    }
    this.mapIsWithdrawing.set(identityCommitment.toString(), true)
  }

  async releaseWithdrawal(identityCommitment: bigint): Promise<void> {
    const rateCommitment = await this.getRateCommitment(identityCommitment)
    const index = this.group.indexOf(rateCommitment)
    if (index === -1) {
      // Sanity check
      throw new Error('Rate commitment is not in the merkle tree. This should never happen')
    }
    const isWithdrawing = this.mapIsWithdrawing.get(identityCommitment.toString())
    if (isWithdrawing === undefined) {
      throw new Error('Identity is not withdrawing')
    }
    this.mapIsWithdrawing.delete(identityCommitment.toString())
    this.mapMessageLimit.delete(identityCommitment.toString())
    this.group.removeMember(index)
  }

  async slash(identitySecret: bigint, _?: string): Promise<void> {
    const identityCommitment = poseidon([identitySecret])
    const rateCommitment = await this.getRateCommitment(identityCommitment)
    const index = this.group.indexOf(rateCommitment)
    if (index === -1) {
      // Sanity check
      throw new Error('Rate commitment is not in the merkle tree. This should never happen')
    }
    this.mapIsWithdrawing.delete(identityCommitment.toString())
    this.mapMessageLimit.delete(identityCommitment.toString())
    this.group.removeMember(index)
  }
}
