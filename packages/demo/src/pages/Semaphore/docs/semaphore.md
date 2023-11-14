# 🔌 Generate Semaphore Proof with CryptKeeper

> **Tip**: Always ensure to check if the client is initialized before making a request to avoid potential errors.

The CryptKeeper extension provides the ability to generate a Semaphore proof. This functionality is crucial for various applications such as voting, signatures, etc. This guide will walk you through the steps necessary to generate a Semaphore proof using CryptKeeper.

# 📋 Steps to Generate Semaphore Proof:

## 1. Set Up Semaphore Proof Parameters

- **Description**: Prepare the parameters required for generating a Semaphore proof. This includes values for `proofType`, `externalNullifier`, and `signal`.
- **Tip**: Make sure to provide valid parameters for successful proof generation.

```ts
interface IGenerateSemaphoreProofParams {
  proofType: MerkleProofType;
  externalNullifier: string;
  signal: string;
}
```

## 2. Define the Merkle Proof Source

- **Description**: Depending on the `proofType`, define the Merkle proof source. If `proofType` is set to `MerkleProofType.ARTIFACTS`, prepare an example group of identity commitments.

## 3. Generate the Semaphore Proof

- **Description**: Use the CryptKeeper client to generate the Semaphore proof by sending a request via `client?.request()` via calling `RPCExternalAction.GENERATE_SEMAPHORE_PROOF`.
- **Screen Display**:
  -A Semaphore proof generation screen will pop up, prompting users to confirm the action.![Semaphore screen](./screenshots/semaphore.png "Semaphore screen")
- **Action**: The client sends a request to the CryptKeeper for generating the Semaphore proof using the defined parameters.

```ts
// 1
```

# ▶️ Demo Action Showcase

Here's a/ sample/s "Demo Action" to help you explore and test this feature.
