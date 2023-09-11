# ⚡ Generate proof

CryptKeeper lets dapps outsource ZK proof generation via the Semaphore and RLN protocols. This section will review Semaphore proofs.

&#x20;[@src/contentscripts/injected.ts](https://github.com/privacy-scaling-explorations/crypt-keeper-extension/blob/master/src/contentscripts/injected.ts)

```typescript
async function semaphoreProof(
    externalNullifier: string,
    signal: string,
    circuitFilePath: string,
    zkeyFilePath: string,
    merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
    merkleProof?: MerkleProof
) {
```

&#x20;The `semaphoreProof` function allows the user to create a proof of a signal to be sent to the Semaphore contract. CryptKeeper uses values provided by the dapp and the private user values to generate the proof and returns it to the dapp for verification.                                                                                         &#x20;

Your dapp should pass in public values (`externalNullifier` and `signal`).

Any circuit files (`circuitFilePath` and `zkeyFilePath`) can be used, but ready-to-use and audited circuit files can be found [here](http://www.trusted-setup-pse.org/) and [here](https://drive.google.com/file/d/1Yi14jwly70VwMSuqJrPCc3j15MWeE7mc/view?usp=sharing).

Merkle witness or Merkle tree components (`merkleProofArtifactsOrStorageAddress` can be provided by a smart contract or as a structured input:&#x20;

* `StorageAddress` points to a Merkle tree on-chain
* `merkleProofArtifact` is a Merkle tree in a specific format
  * [@src/types/index.ts](https://github.com/privacy-scaling-explorations/crypt-keeper-extension/blob/817ec0e1f336ab61c9c70f4918853e7c279dd21d/src/types/index.ts#L56)
  * ```typescript
    export type MerkleProofArtifacts = {
        leaves: string[]
        depth: number
        leavesPerNode: number
    }
    ```

`SemaphoreProof` requires the following arguments:

`externalNullifier`

* a unique identifier for the signal to prevent double signaling
* public input provided by dapp

`signal`

* hash of the content of the message
* public input provided by dapp

`circuitFilePath`

* location of the circuit file
* used to generate the ZK proof in the browser

`zkeyFilePath`

* the zkeyFile contains the trusted setup \[link] files and is the starting point for creating a circuit
* location of the zkey file

`merkleProofArtifactsOrStorageAddress`

* object providing Merkle witness <mark style="color:blue;"></mark> directly (`merkleProofArtifact`) or the secure service address from which the Merkle witness should be obtained  (`merkleStorageAddress`)&#x20;
* To generate a proof, a user must provide the Merkle path that leads to the user’s identity in the Merkle tree&#x20;



&#x20;

**RLN Proofs**

[RLN (Rate-Limiting Nullifier)](https://rate-limiting-nullifier.github.io/rln-docs/) is a ZK gadget or mechanism that enables spam prevention for anonymous environments. RLN Proofs are the same as Semaphore proofs except they generate proofs for a specific epoch (time period) and require an additional argument: `rlnIdentifier`.
