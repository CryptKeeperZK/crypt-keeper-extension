/**
 * @module cache
 * @description `ICache` is only responsible for storing necessary information to detect spams and automatically
 * evaluating proofs for rate limit breaches. No proof validation inside and thus proofs **must** be validated
 * before added to the `ICache`.
 */
import { StrBigInt } from './types'
import { shamirRecovery } from './common'

/**
 * Store necessary information of a proof to detect spams
 */
export type CachedProof = {
  x: StrBigInt,
  y: StrBigInt,
  // epoch is used to remove stale proofs
  epoch: StrBigInt,
  // internalNullifier
  nullifier: StrBigInt,
}

type EpochCache = {
  [nullifier: string]: CachedProof[]
}

type CacheMap = {
  [epoch: string]: EpochCache
}


export enum Status {
  VALID,
  DUPLICATE,
  BREACH,
}

export type EvaluatedProof = {
  status: Status,
  nullifier?: StrBigInt,
  secret?: bigint,
  msg?: string,
}

export interface ICache {
  /**
   * Add a proof to the cache and automatically evaluate it for rate limit breaches.
   * @param proof CachedProof
   * @returns an object with the status of the proof and the nullifier and secret if the proof is a breach
   */
  addProof(proof: CachedProof): EvaluatedProof
  /**
   * Check the proof if it is either valid, duplicate, or breaching.
   * Does not add the proof to the cache to avoid side effects.
   * @param proof CachedProof
   * @returns an object with the status of the proof and the nullifier and secret if the proof is a breach
   */
  checkProof(proof: CachedProof): EvaluatedProof
}

export const DEFAULT_CACHE_SIZE = 100
/**
 * Cache for storing proofs and automatically evaluating them for rate limit breaches
 * in the memory.
 */
export class MemoryCache implements ICache {
  cacheLength: number

  cache: CacheMap

  epochs: string[]

  /**
   * @param cacheLength the maximum number of epochs to store in the cache, default is 100, set to 0 to automatic pruning
   * @param cache the cache object to use, default is an empty object
   */
  constructor(cacheLength?: number) {
    this.cacheLength = cacheLength ? cacheLength : DEFAULT_CACHE_SIZE
    this.cache = {}
    this.epochs = []
  }

  /**
   * Add a proof to the cache and automatically evaluate it for rate limit breaches.
   * @param proof CachedProof
   * @returns an object with the status of the proof and the nullifier and secret if the proof is a breach
   */
  addProof(proof: CachedProof): EvaluatedProof {
    // epoch, nullifier, x, y
    // Since `BigInt` can't be used as key, use String instead
    const epochString = String(proof.epoch)
    const nullifier = String(proof.nullifier)
    // Check if the proof status
    const resCheckProof = this.checkProof(proof)
    // Only add the proof to the cache automatically if it's not seen before.
    if (resCheckProof.status === Status.VALID || resCheckProof.status === Status.BREACH) {
      // Add proof to cache
      this.cache[epochString][nullifier].push(proof)
    }
    return resCheckProof
  }

  /**
   * Check the proof if it is either valid, duplicate, or breaching.
   * Does not add the proof to the cache to avoid side effects.
   * @param proof CachedProof
   * @returns an object with the status of the proof and the nullifier and secret if the proof is a breach
   */
  checkProof(proof: CachedProof): EvaluatedProof {
    const epochString = String(proof.epoch)
    const nullifier = String(proof.nullifier)
    this.shiftEpochs(epochString)
    // If nullifier doesn't exist for this epoch, create an empty array
    this.cache[epochString][nullifier] = this.cache[epochString][nullifier] || []
    const proofs = this.cache[epochString][nullifier]

    // Check if the proof already exists. It's O(n) but it's not a big deal since n is exactly the
    // rate limit and it's usually small.
    function isSameProof(proof1: CachedProof, proof2: CachedProof): boolean {
      return (
        BigInt(proof1.x) === BigInt(proof2.x) &&
        BigInt(proof1.y) === BigInt(proof2.y) &&
        BigInt(proof1.epoch) === BigInt(proof2.epoch) &&
        BigInt(proof1.nullifier) === BigInt(proof2.nullifier)
      )
    }
    // OK
    if (proofs.length === 0) {
      return { status: Status.VALID, nullifier: nullifier, msg: 'Proof added to cache' }
    // Exists proof with same epoch and nullifier. Possible breach or duplicate proof
    } else {
      const sameProofs = this.cache[epochString][nullifier].filter(p => isSameProof(p, proof))
      if (sameProofs.length > 0) {
        return { status: Status.DUPLICATE, msg: 'Proof already exists' }
      } else {
        const otherProof = proofs[0]
        // Breach. Return secret
        const [x1, y1] = [BigInt(proof.x), BigInt(proof.y)]
        const [x2, y2] = [BigInt(otherProof.x), BigInt(otherProof.y)]
        const secret = shamirRecovery(x1, x2, y1, y2)
        return { status: Status.BREACH, nullifier: nullifier, secret: secret, msg: 'Rate limit breach, secret attached' }
      }
    }
  }

  private shiftEpochs(epoch: string) {
    if (this.cache[epoch]) {
      // If epoch already exists, return
      return
    } else {
      // If epoch doesn't exist, create it
      this.cache[epoch] = {}
      this.epochs.push(epoch)
      if (this.cacheLength > 0 && this.epochs.length > this.cacheLength) {
        this.removeEpoch(this.epochs[0])
      }
    }
    this.cache[epoch] = this.cache[epoch] || {}
  }

  private removeEpoch(epoch: string) {
    delete this.cache[epoch]
    this.epochs.shift()
  }
}