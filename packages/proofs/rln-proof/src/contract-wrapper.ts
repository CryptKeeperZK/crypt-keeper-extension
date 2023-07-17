import { Proof } from './types'
import { ethers } from 'ethers'


const erc20ABI = JSON.parse('[{"constant": true, "inputs": [], "name": "name", "outputs": [{"name": "", "type": "string"}], "payable": false, "stateMutability": "view", "type": "function"}, {"constant": false, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"}, {"constant": true, "inputs": [], "name": "totalSupply", "outputs": [{"name": "", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"}, {"constant": false, "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "transferFrom", "outputs": [{"name": "", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"}, {"constant": true, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "payable": false, "stateMutability": "view", "type": "function"}, {"constant": true, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"}, {"constant": true, "inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "payable": false, "stateMutability": "view", "type": "function"}, {"constant": false, "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"}, {"constant": true, "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}], "name": "allowance", "outputs": [{"name": "", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"}, {"payable": true, "stateMutability": "payable", "type": "fallback"}, {"anonymous": false, "inputs": [{"indexed": true, "name": "owner", "type": "address"}, {"indexed": true, "name": "spender", "type": "address"}, {"indexed": false, "name": "value", "type": "uint256"}], "name": "Approval", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "name": "from", "type": "address"}, {"indexed": true, "name": "to", "type": "address"}, {"indexed": false, "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"}]')

export const rlnContractABI = JSON.parse('[{"inputs": [{"internalType": "uint256", "name": "minimalDeposit", "type": "uint256"}, {"internalType": "uint256", "name": "depth", "type": "uint256"}, {"internalType": "uint8", "name": "feePercentage", "type": "uint8"}, {"internalType": "address", "name": "feeReceiver", "type": "address"}, {"internalType": "uint256", "name": "freezePeriod", "type": "uint256"}, {"internalType": "address", "name": "_token", "type": "address"}, {"internalType": "address", "name": "_verifier", "type": "address"}], "stateMutability": "nonpayable", "type": "constructor"}, {"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "identityCommitment", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "messageLimit", "type": "uint256"}, {"indexed": false, "internalType": "uint256", "name": "index", "type": "uint256"}], "name": "MemberRegistered", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "index", "type": "uint256"}, {"indexed": false, "internalType": "address", "name": "slasher", "type": "address"}], "name": "MemberSlashed", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": false, "internalType": "uint256", "name": "index", "type": "uint256"}], "name": "MemberWithdrawn", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}], "name": "OwnershipTransferred", "type": "event"}, {"inputs": [], "name": "DEPTH", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "MINIMAL_DEPOSIT", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "SET_SIZE", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "identityCommitmentIndex", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "members", "outputs": [{"internalType": "address", "name": "userAddress", "type": "address"}, {"internalType": "uint256", "name": "messageLimit", "type": "uint256"}, {"internalType": "uint256", "name": "index", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "identityCommitment", "type": "uint256"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "register", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "identityCommitment", "type": "uint256"}], "name": "release", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "identityCommitment", "type": "uint256"}, {"internalType": "address", "name": "receiver", "type": "address"}, {"internalType": "uint256[8]", "name": "proof", "type": "uint256[8]"}], "name": "slash", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "token", "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "verifier", "outputs": [{"internalType": "contract IVerifier", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "identityCommitment", "type": "uint256"}, {"internalType": "uint256[8]", "name": "proof", "type": "uint256[8]"}], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "withdrawals", "outputs": [{"internalType": "uint256", "name": "blockNumber", "type": "uint256"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "address", "name": "receiver", "type": "address"}], "stateMutability": "view", "type": "function"}]')

type User = {
  userAddress: string,
  messageLimit: bigint,
  index: bigint,
}

type Withdrawal = {
  blockNumber: bigint,
  amount: bigint,
  receiver: string,
}


function proofToArray(proof: Proof) {
  // verifier.verifyProof(
  //     [proof[0], proof[1]],
  //     [[proof[2], proof[3]], [proof[4], proof[5]]],
  //     [proof[6], proof[7]],
  //     [identityCommitment, uint256(uint160(receiver))]
  // );
  return [
    BigInt(proof.pi_a[0]),
    BigInt(proof.pi_a[1]),
    BigInt(proof.pi_b[0][0]),
    BigInt(proof.pi_b[0][1]),
    BigInt(proof.pi_b[1][0]),
    BigInt(proof.pi_b[1][1]),
    BigInt(proof.pi_c[0]),
    BigInt(proof.pi_c[1]),
  ]
}

/**
    event MemberRegistered(uint256 identityCommitment, uint256 messageLimit, uint256 index);
    event MemberWithdrawn(uint256 index);
    event MemberSlashed(uint256 index, address slasher);
 */
export type EventMemberRegistered = {
  name: 'MemberRegistered',
  identityCommitment: bigint,
  messageLimit: bigint,
  index: bigint,
}

export type EventMemberWithdrawn = {
  name: 'MemberWithdrawn',
  index: bigint,
}

export type EventMemberSlashed = {
  name: 'MemberSlashed',
  index: bigint,
  slasher: string,
}

export class RLNContract {
  // Either a signer (with private key)  or a provider (without private key and read-only)
  private provider: ethers.Provider

  private signer?: ethers.Signer

  private rlnContract: ethers.Contract

  private contractAtBlock: number

  constructor(args: {
    provider: ethers.Provider,
    signer?: ethers.Signer,
    contractAddress: string,
    contractAtBlock: number,
  }) {
    this.provider = args.provider
    this.signer = args.signer
    this.rlnContract = new ethers.Contract(args.contractAddress, rlnContractABI, this.getContractRunner())
    this.contractAtBlock = args.contractAtBlock
  }

  private getContractRunner() {
    // If signer is given, use signer. Else, use provider.
    return this.signer || this.provider
  }

  async getTokenAddress() {
    return this.rlnContract.token()
  }

  async getSignerAddress() {
    if (this.signer === undefined) {
      throw new Error('Cannot get signer address if signer is not set')
    }
    return this.signer.getAddress()
  }

  async getLogs() {
    const rlnContractAddress = await this.rlnContract.getAddress()
    const currentBlockNumber = await this.provider.getBlockNumber()
    if (currentBlockNumber < this.contractAtBlock) {
      throw new Error('Current block number is lower than the block number at which the contract was deployed')
    }
    const logs = await this.provider.getLogs({
      address: rlnContractAddress,
      fromBlock: this.contractAtBlock,
      toBlock: currentBlockNumber,
    })
    const events = await Promise.all(logs.map(log => this.handleLog(log)))
    return events.filter(x => x !== undefined) as (EventMemberRegistered | EventMemberWithdrawn | EventMemberSlashed)[]
  }

  private async handleLog(log: ethers.Log): Promise<EventMemberRegistered | EventMemberWithdrawn | EventMemberSlashed | undefined> {
    const memberRegisteredFilter = this.rlnContract.filters.MemberRegistered()
    const memberWithdrawnFilter = this.rlnContract.filters.MemberWithdrawn()
    const memberSlashedFilter = this.rlnContract.filters.MemberSlashed()
    const memberRegisteredTopics: ethers.TopicFilter = await memberRegisteredFilter.getTopicFilter()
    const memberWithdrawnTopics: ethers.TopicFilter = await memberWithdrawnFilter.getTopicFilter()
    const memberSlashedTopics: ethers.TopicFilter = await memberSlashedFilter.getTopicFilter()

    if (log.topics[0] === memberRegisteredTopics[0]) {
      const decoded = this.rlnContract.interface.decodeEventLog(memberRegisteredFilter.fragment, log.data)
      return {
        name: 'MemberRegistered',
        identityCommitment: decoded.identityCommitment,
        messageLimit: decoded.messageLimit,
        index: decoded.index,
      }
    } else if (log.topics[0] === memberWithdrawnTopics[0]) {
      const decoded = this.rlnContract.interface.decodeEventLog(memberWithdrawnFilter.fragment, log.data)
      return {
        name: 'MemberWithdrawn',
        index: decoded.index,
      }
    } else if (log.topics[0] === memberSlashedTopics[0]) {
      const decoded = this.rlnContract.interface.decodeEventLog(memberSlashedFilter.fragment, log.data)
      return {
        name: 'MemberSlashed',
        index: decoded.index,
        slasher: decoded.slasher,
      }
    } else {
      // Just skip this log
      return undefined
    }
  }

  async register(identityCommitment: bigint, messageLimit: bigint): Promise<ethers.TransactionReceipt> {
    const rlnContractAddress = await this.rlnContract.getAddress()
    const pricePerMessageLimit = await this.rlnContract.MINIMAL_DEPOSIT()
    const amount = messageLimit * pricePerMessageLimit
    const tokenContract = new ethers.Contract(
      await this.getTokenAddress(),
      erc20ABI,
      this.getContractRunner(),
    )
    const txApprove = await tokenContract.approve(rlnContractAddress, amount)
    await txApprove.wait()
    const txRegister = await this.rlnContract.register(identityCommitment, amount)
    const receipt = await txRegister.wait()
    return receipt
  }

  async getUser(identityCommitment: bigint): Promise<User> {
    const [ userAddress, messageLimit, index] = await this.rlnContract.members(identityCommitment)
    return {
      userAddress,
      messageLimit,
      index,
    }
  }

  async getWithdrawal(identityCommitment: bigint): Promise<Withdrawal> {
    const [ blockNumber, amount, receiver ] = await this.rlnContract.withdrawals(identityCommitment)
    return {
      blockNumber,
      amount,
      receiver,
    }
  }

  async withdraw(identityCommitment: bigint, proof: Proof): Promise<ethers.TransactionReceipt> {
    const proofArray = proofToArray(proof)
    const tx = await this.rlnContract.withdraw(identityCommitment, proofArray)
    const receipt = await tx.wait()
    return receipt
  }

  async release(identityCommitment: bigint): Promise<ethers.TransactionReceipt> {
    const tx = await this.rlnContract.release(identityCommitment)
    const receipt = await tx.wait()
    return receipt
  }

  async slash(identityCommitment: bigint, receiver: string, proof: Proof): Promise<ethers.TransactionReceipt> {
    const proofArray = proofToArray(proof)
    const tx = await this.rlnContract.slash(identityCommitment, receiver, proofArray)
    const receipt = await tx.wait()
    return receipt
  }

  async isRegistered(identityCommitment: bigint): Promise<boolean> {
    const user = await this.getUser(identityCommitment)
    return user.userAddress !== ethers.ZeroAddress
  }
}
