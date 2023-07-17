
# Rate Limiting Nullifier Javascript / Typescript Library

## Contents

- [Rate Limiting Nullifier Javascript / Typescript Library](#rate-limiting-nullifier-javascript-typescript-library)
  * [Contents](#contents)
  * [Description](#description)
  * [Install](#install)
    + [Build circuits and get the parameter files](#build-circuits-and-get-the-parameter-files)
      - [With script (Recommended)](#with-script-recommended)
      - [Manually clone and build the circuits](#manually-clone-and-build-the-circuits)
  * [Usage](#usage)
    + [Initializing an RLN instance](#initializing-an-rln-instance)
    + [Accessing Identity and Identity Commitment](#accessing-identity-and-identity-commitment)
    + [Registering](#registering)
    + [Generating a proof](#generating-a-proof)
    + [Withdrawing](#withdrawing)
    + [Verifying a proof](#verifying-a-proof)
    + [Saving a proof](#saving-a-proof)
    + [Slashing a user](#slashing-a-user)
  * [Example](#example)
  * [Tests](#tests)
  * [Bugs, Questions & Features](#bugs-questions-features)
  * [License](#license)

## Description

RLN (Rate-Limiting Nullifier) is a zk-gadget/protocol that enables spam prevention in anonymous environments.

The core of RLN is in the [circuit logic](https://github.com/Rate-Limiting-Nullifier/circom-rln), documentation [here](https://rate-limiting-nullifier.github.io/rln-docs/protocol_spec.html#technical-side-of-rln). RLNjs provides easy management of the registry and proof creation.

[`RLN`](./src/rln.ts) class is the core of RLNjs. It allows user to generate proofs, verify proofs, and detect spams. Also, user can register to RLN, withdraw, and slash spammers.

| _Tests Ran on an M2 Macbook_ | Time   |
| ---------------------------- | ------ |
| RLN Proof                    | ~800ms |
| RLN Proof Verification       | ~130ms |
| Withdraw Proof               | ~260ms |
| Withdraw Proof Verification  | ~145ms |

## Install

Install rlnjs with npm:

```bash
npm install rlnjs
```

### Build circuits and get the parameter files

Circuit parameter files `circuit.wasm`, `final.zkey`, and `verification_key.json` are needed when instantiating a [RLN](src/rln.ts) instance. You can choose to build the circuits with script or manually.

#### With script (Recommended)

Run the script [scripts/build-zkeys.sh](scripts/build-zkeys.sh) and it will build the circuits for you.

```bash
./scripts/build-zkeys.sh
```

In the project root, you should can see the zkey files in the `./zkeyFiles` folder.
```bash
$ tree ./zkeyFiles
zkeyFiles
├── rln
│   ├── circuit.wasm
│   ├── final.zkey
│   └── verification_key.json
└── withdraw
    ├── circuit.wasm
    ├── final.zkey
    └── verification_key.json
```

#### Manually clone and build the circuits

> Circom needs to be installed, please see this [link](https://docs.circom.io/getting-started/installation/) for installation instructions.

```bash
git clone https://github.com/Rate-Limiting-Nullifier/circom-rln.git &&
cd circom-rln
```

> Make sure the depth of the merkle tree are the same in both rlnjs and rln-circuits, otherwise verification will fail. You need to rebuild the circuits every time the circuit is changed.

```bash
npm i &&
npm run build
```

The previous step should have produced the following files:

```bash
$ tree zkeyFiles
zkeyFiles
├── rln
│   ├── circuit.config.toml
│   ├── circuit.wasm
│   ├── final.zkey
│   └── verification_key.json
└── withdraw
    ├── circuit.config.toml
    ├── circuit.wasm
    ├── final.zkey
    └── verification_key.json
```

## Usage

### Initializing an RLN instance

#### Create RLN instance with the contract registry

The following snippet creates RLN instance with default settings.

```typescript
const rlnIdentifier = BigInt(5566)
const contractAddress = "0x..."
const contractAtBlock = 12345678
const provider = new ethers.JsonRpcProvider(url)
const signer = await provider.getSigner(0)

// Create an RLN instance with the contract registry.
// ethers provider and the contract address are both required then.
const rln = RLN.createWithContractRegistry({
  /* These parameters are required */
  rlnIdentifier, // The unique id representing your application
  provider, // ethers.js provider
  contractAddress, // RLN contract address

  /* These parameters are optional */
  contractAtBlock, // The block number at which the RLN contract was deployed. If not given, default is 0
  signer, // ethers.js signer. If not given, users won't be able to execute write operations to the RLN contract
  // ... See all optional parameters in RLN constructor in src/rln.ts
})
```

Custom options can be passed to the RLN instance. Note that default tree depth is `20`. If you're using a tree depth other than `20`, you need to the circuit parameters when creating the RLN instance. See [RLN constructor](src/rln.ts) for all options.

```typescript
import path from "path"

import { ethers } from "ethers"
import { Identity } from '@semaphore-protocol/identity'
import { RLN, IRLNRegsitry, ContractRLNRegistry } from "rlnjs"

// Assume you have built `rln.circom` and `withdraw.circom` and have placed them under the folder ./zkeyFiles/rln
// and ./zkeyFiles/withdraw respectively.

/* rln circuit parameters */
const rlnZkeyFilesDir = path.join("zkeyFiles", "rln");
// zkeyFiles/rln/verification_key.json
const rlnVerificationKey = JSON.parse(
  fs.readFileSync(path.join(rlnZkeyFilesDir, "verification_key.json"), "utf-8")
)
// zkeyFiles/rln/circuit.wasm
const rlnWasmFilePath = path.join(rlnZkeyFilesDir, "circuit.wasm")
// zkeyFiles/rln/final.zkey
const rlnFinalZkeyPath = path.join(rlnZkeyFilesDir, "final.zkey")

/* withdraw circuit parameters */
const withdrawZkeyFilesDir = path.join("zkeyFiles", "withdraw")
// zkeyFiles/withdraw/circuit.wasm
const withdrawWasmFilePath = path.join(withdrawZkeyFilesDir, "circuit.wasm")
// zkeyFiles/withdraw/final.zkey
const withdrawFinalZkeyPath = path.join(withdrawZkeyFilesDir, "final.zkey")

const rlnIdentifier = BigInt(5566)
const treeDepth = 16
const provider = new ethers.JsonRpcProvider(url)
const contractAddress = "0x..."
const signer = await provider.getSigner(0)
const identity = new Identity("1234")

// Create an RLN instance with the contract registry.
// ethers provider and the contract address are both required then.
const rln = RLN.createWithContractRegistry({
  /* These parameters are required */
  rlnIdentifier, // The unique id representing your application
  provider, // ethers.js provider
  contractAddress, // RLN contract address

  /* These parameters are optional */
  contractAtBlock, // The block number at which the RLN contract was deployed. If not given, default is 0
  identity, // the semaphore identity. If not given, a new identity is created
  signer, // ethers.js signer. If not given, users won't be able to execute write operations to the RLN contract
  treeDepth, // The depth of the merkle tree. Default is 20
  wasmFilePath: rlnWasmFilePath, // The path to the rln circuit wasm file. If not given, `createProof` will not work
  finalZkeyPath: rlnFinalZkeyPath, // The path to the rln circuit final zkey file. If not given, `createProof` will not work
  verificationKey: rlnVerificationKey, // The rln circuit verification key. If not given, `verifyProof` will not work
  withdrawWasmFilePath, // The path to the withdraw circuit wasm file. If not given, `withdraw` will not work
  withdrawFinalZkeyPath, // The path to the withdraw circuit final zkey file. If not given, `withdraw` will not work

  // ... See all optional parameters in RLN constructor in src/rln.ts
})
```

#### Create RLN instance with other types of registries
You can also initialize an RLN instance with the constructor, but you need to provide a registry. This is particularly useful if you want to use a custom registry instead of the contract registry. For testing, you could use `MemoryRLNRegistry` and let different RLN instances use the same registry.

```typescript
const registry: IRLNRegistry = new MemoryRLNRegistry(rlnIdentifier, treeDepth)
const rln1 = new RLN({rlnIdentifier, registry, treeDepth})
const rln2 = new RLN({rlnIdentifier, registry, treeDepth})

// ...Do something with rln1 and rln2
```

#### Prover-only and Verifier-only modes
RLN instance must at least be initialized with either `wasmFilePath` and `finalZkeyPath`, or `verificationKey`. If you only provide `wasmFilePath` and `finalZkeyPath`, you can only generate proofs. You will get an error if you try to verify a proof. If you only provide `verificationKey`, you can only verify proofs. You will get an error if you try to generate a proof. If you provide both, you can both generate and verify proofs.

```typescript
const rlnProverOnly = new RLN({
  rlnIdentifier,
  registry,
  wasmFilePath: rlnWasmFilePath,
  finalZkeyPath: rlnFinalZkeyPath,
  // Missing `verificationKey`
  withdrawWasmFilePath,
  withdrawFinalZkeyPath,
})
const rlnVerifierOnly = new RLN({
  rlnIdentifier,
  registry,
  // Missing `wasmFilePath` and `finalZkeyPath`
  verificationKey: rlnVerificationKey,
  withdrawWasmFilePath,
  withdrawFinalZkeyPath,
})
```

### Accessing Identity and Identity Commitment

When an RLN instance is initialized without `identity` given, it creates an `Identity` for you. You can access identity and its commitment using `rln.identity` and `rln.identityCommitment` respectively.

```typescript
// Example of accessing the generated identity commitment
const identity = rln.identity
const identityCommitment = rln.identityCommitment
```

### Registering

```typescript
const messageLimit = BigInt(1);
// This registers the identity commitment to the registry
// If you're using ContractRLNRegistry, you will send a transaction to the RLN contract, sending tokens, and get registered.
await rln.register(messageLimit);
console.log(await rln.isRegistered()) // true
```

### Generating a proof

```typescript
const epoch = BigInt(123)
const message = "Hello World"
const proof = await rln.createProof(epoch, message);
```
You can generate a proof for an epoch and a message by calling `rln.createProof()`. For the same epoch, you can only generate up to `messageLimit` proofs, each of them with a unique `messageId` within the range `[0, messageLimit-1]`. Message id is not required here because after registering, there is a message id counter inside to avoid reaching the rate limit.

> Note that the built-in [MemoryMessageIDCounter](./src/message-id-counter.ts) is not persistent. If you stop the application and restart it in the same epoch, you might risk spamming. If you want to persist the message id counter, you can implement your own message id counter by implementing the [IMessageIDCounter](./src/message-id-counter.ts) interface and set it with `rln.setMessageIDCounter()`.

### Withdrawing
```typescript
// This withdraws the identity commitment from the registry.
// If you're using ContractRLNRegistry, you will send a transaction to the RLN contract, and get the tokens back.
await rln.withdraw();
// after withdrawing, you still need to wait for the freezePeriod in order to release the withdrawal
console.log(await rln.isRegistered()) // true

// If you're using ContractRLNRegistry, after `freezePeriod` (i.e. `freezePeriod + 1` blocks), you can release the withdrawal and successfully get the funds back
await rln.releaseWithdrawal();
console.log(await rln.isRegistered()) // false
```

### Verifying a proof

```typescript
const proofResult = await rln.verifyProof(epoch, message, proof) // true or false
```

A proof can be invalid in the following conditions:
- Proof mismatches epoch, message, or rlnIdentifier
- The snark proof itself is invalid

### Saving a proof
User should save all proofs they receive to detect spams. You can save a proof by calling `rln.saveProof()`. The return value is an object indicating the status of the proof.

```typescript
const result = await rln.saveProof(proof)
// status can be VALID, DUPLICATE, BREACH.
// - VALID means the proof is successfully added to the cache
// - DUPLICATE means the proof is already saved before
// - BREACH means the added proof breaches the rate limit, in which case the `secret` is recovered and is accessible by `result.secret`
const status = result.status
// if status is "breach", you can get the secret by
const secret = result.secret
```

> 1. `verifyProof(epoch, message, proof)` and `saveProof(proof)` are different. `verifyProof` not only verifies the snark proof but ensure the proof matches `epoch` and `message`, while `saveProof()` does not verify the snark proof at all. `saveProof()` checks if the proof will spam and adds the proof to cache for future spam detection. If one wants to make sure the proof is for `epoch` and `message` and also detect spams, they should call both `verifyProof` and `saveProof`.

> 2. `saveProof` is not persistent. If you restart the application, you might fail to detect some spams. If you want to persist the proof cache, you can implement your own proof cache by implementing the [ICache](./src/cache.ts) interface and set it in the constructor.

### Slashing a user

```typescript
const slashReceiver = "0x0000000000000000000000000000000000001234"
await rln.slash(secret, receiver) // user using the secret gets slashed and the funds go to the receiver
```
If receiver is not given, the funds will go to the signer.
```typescript
await rln.slash(secret) // funds go to the signer
```

## Example

Please see the examples [here](./examples/). We have examples for [NodeJS](./examples/node/) and [browser](./examples/browser/).

## Tests

```bash
npm test
```

## Bugs, Questions & Features

If you find any bugs, have any questions, or would like to propose new features, feel free to open an [issue](https://github.com/Rate-Limiting-Nullifier/RLNjs/issues/new/).

## License

RLNjs is released under the [MIT license](https://opensource.org/licenses/MIT).
