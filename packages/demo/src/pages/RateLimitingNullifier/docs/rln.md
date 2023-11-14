# 🔌 Generate Rate Limiting Nullifier (RLN) Proof

> **Tip**: Always ensure to check if the client is initialized before making a request to avoid potential errors.

Generating RLN proofs with CryptKeeper aids in preserving user privacy while participating in public networks. The following documentation provides an overview and steps on how to generate an RLN proof using the provided functionality.

# 📋 Steps to Generate RLN Proof:

## 1. Set Up RLN Proof Parameters

- **Description**: Begin by preparing the necessary parameters to generate an RLN proof. These parameters include values like `proofType`, `rlnIdentifier`, `message`, `messageLimit`, `messageId`, and `epoch`.
- **Tip**: Ensure that you feed in valid parameters to avoid discrepancies in proof generation.

```ts
interface IGenerateRLNProofParams {
  proofType: MerkleProofType;
  rlnIdentifier: string;
  message: string;
  messageLimit: number;
  messageId: number;
  epoch: string;
}
```

## 2. Define the Merkle Proof Source

- **Description**: Depending on the `proofType`, define the Merkle proof source. If `proofType` is set to `MerkleProofType.ARTIFACTS`, prepare an example group of identity commitments.

## 3. Generate the Semaphore Proof

- **Screen Display**:
  -An RLN proof generation screen will pop up, requesting users to confirm their action.![RLN 1 screen](./screenshots/rln-1.png "RLN 1 screen") ![RLN 2 screen](./screenshots/rln-2.png "RLN 2 screen")

- **Action**: The client communicates with CryptKeeper, requesting the generation of an RLN proof based on the defined parameters.

```ts
// 1
```

# ▶️ Demo Action Showcase

Here's a/ sample/s "Demo Action" to help you explore and test this feature.
