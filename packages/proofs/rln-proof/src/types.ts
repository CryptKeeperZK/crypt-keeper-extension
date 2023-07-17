export type StrBigInt = string | bigint

/**
 * snarkjs proof.
 */
export type Proof = {
  pi_a: StrBigInt[]
  pi_b: StrBigInt[][]
  pi_c: StrBigInt[]
  protocol: string
  curve: string
}


/**
 * snarkjs verification key.
 */
export type VerificationKey = {
  protocol: string,
  curve: string,
  nPublic: number,
  vk_alpha_1: string[],
  vk_beta_2: string[][],
  vk_gamma_2: string[][],
  vk_delta_2: string[][],
  vk_alphabeta_12: string[][][],
  IC: string[][],
}

export { type MerkleProof } from '@zk-kit/incremental-merkle-tree'
