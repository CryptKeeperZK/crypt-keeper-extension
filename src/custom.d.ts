declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.gif" {
  const content: string;
  export default content;
}

declare module "rlnjs" {
  export interface RLNFullProof {
    proof: Proof;
    publicSignals: RLNPublicSignals;
  }

  export class RLN {
    public constructor(circuitFilePath: string, zkeyFilePath: string, verificationKey: string);

    public generateProof(signal: string, merkleProof: MerkleProof, externalNullifier: string): Promise<RLNFullProof>;
  }

  export interface Proof {
    pi_a: StrBigInt[];
    pi_b: StrBigInt[][];
    pi_c: StrBigInt[];
    protocol: string;
    curve: string;
  }

  type StrBigInt = string | bigint;

  export type MerkleProof = {
    root: StrBigInt;
    leaf: StrBigInt;
    siblings: StrBigInt[];
    pathIndices: number[];
  };

  export type RLNPublicSignals = {
    yShare: StrBigInt;
    merkleRoot: StrBigInt;
    internalNullifier: StrBigInt;
    signalHash: StrBigInt;
    epoch: StrBigInt;
    rlnIdentifier: StrBigInt;
  };
}
