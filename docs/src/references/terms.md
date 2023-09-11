---
description: Background information on relevant concepts
---

# 📘 Terms

### Circuits

A circuit is a mathematical representation of the computations that need to be performed to prove a statement. A circuit consists of a set of wires that carry values (inputs) and connect them to addition and multiplication gates, which restrict specific operations on the inputs. The prover generates a proof, which is a succinct representation of the input and output of the circuit, and sends it to the verifier, who can then efficiently verify the proof without knowing the input values.

&#x20;For more background information on how circuits work, check out this link: [https://docs.circom.io/background/background/](https://docs.circom.io/background/background/)

&#x20;Ready-to-use and audited circuit files can be found [here](http://www.trusted-setup-pse.org/) and [here](https://drive.google.com/file/d/1Yi14jwly70VwMSuqJrPCc3j15MWeE7mc/view?usp=sharing).

&#x20;

### Merkle Tree

A Merkle tree is a type of data structure used to efficiently verify the integrity of large data sets.&#x20;

It is constructed by repeatedly hashing pairs of data until a single hash, called the root, is left. Each pair of child nodes in the tree is connected to its parent node by a hash link, and each leaf node in the tree contains a piece of the original data. When verifying the integrity of the data, only the leaf node and the corresponding hash links leading to the root need to be checked, reducing the amount of data that needs to be examined.&#x20;

In the [Semaphore](https://semaphore.appliedzkp.org/docs/introduction) protocol, Merkle trees are used to keep track of the members of a group in the protocol. When a user joins a group in Semaphore, their public identity commitment is added to that group's Merkle tree. This allows the protocol to check that the user is a member of the group without revealing their identity.

&#x20;&#x20;

### Merkle Witness

A Merkle witness is a small piece of data that can be used to prove the authenticity of a larger piece of data. Specifically, they are a set of values that are used to prove the authenticity of a particular leaf node in a Merkle tree. The witness includes the leaf value and the values of the hashes in the path from the leaf node to the root of the tree. The authenticity of the leaf node is proven by recomputing the hashes along the path and comparing them to the included witness values.

&#x20;

### RLN

[RLN (Rate-Limiting Nullifier)](https://rate-limiting-nullifier.github.io/rln-docs/) is a ZK gadget or mechanism that enables spam prevention for anonymous environments.

&#x20;Anonymity opens up the possibility for spam and Sybil attack vectors for certain applications, which could seriously degrade the user experience and the overall functioning of the application. For example, imagine a chat application where users are anonymous. Now, everyone can write an unlimited number of spam messages, but we don't have the ability to kick this member because the spammer is anonymous.

&#x20;RLN helps us identify and "kick" the spammer. Moreover, RLN can be used to limit users in the number of actions they are allowed to make within a given timeframe.

&#x20;&#x20;

### Semaphore Protocol

CryptKeeper can be thought of as a browser extension for [Semaphore, ](https://semaphore.appliedzkp.org/docs/introduction)allowing users to use basic Semaphore functions separately from the app layer.

&#x20;[Semaphore](https://github.com/semaphore-protocol/semaphore) is a [zero-knowledge](https://z.cash/technology/zksnarks) protocol that allows you to cast a signal (for example, a vote or endorsement) as a provable group member without revealing your identity. Additionally, it provides a simple mechanism to prevent double-signaling.

&#x20;With Semaphore, you can allow your users to do the following:

1. [Create a Semaphore identity](https://semaphore.appliedzkp.org/docs/guides/identities).
2. [Add their Semaphore identity to a group (i.e. _Merkle tree_)](https://semaphore.appliedzkp.org/docs/guides/groups).
3. [Send a verifiable, anonymous signal (e.g a vote or endorsement)](https://semaphore.appliedzkp.org/docs/guides/proofs).

&#x20;&#x20;

### Semaphore Identities

A [Semaphore identity](https://semaphore.appliedzkp.org/docs/guides/identities) is an object that is used to join a Semaphore group. It contains two private values that are generated when the identity is created: an \`identity trapdoor\` and an \`identity nullifier\`. These values are kept secret by the identity owner and are used to generate ZK proofs and authenticate signals.

&#x20;The identity also has a public value called the "identity commitment", which is similar to a public Ethereum address and is used to represent the identity of a group member. Identities can be created randomly or deterministically from a secret message and can be saved and reused later as a JSON string.

&#x20;

### Semaphore proofs

A Semaphore proof is a zero-knowledge proof that is used to anonymously signal a message from within a Semaphore group. The proof is generated by passing in a user's Semaphore identity, the group the user belongs to, an external nullifier to prevent double-signaling, and the message the user wants to send.

&#x20;Developers can use Semaphore for the following:

* [Generate a proof off-chain](https://semaphore.appliedzkp.org/docs/guides/proofs#generate-a-proof-off-chain)
* [Verify a proof off-chain](https://semaphore.appliedzkp.org/docs/guides/proofs#verify-a-proof-off-chain)
* [Verify a proof on-chain](https://semaphore.appliedzkp.org/docs/guides/proofs#verify-a-proof-on-chain)

&#x20;&#x20;

### Trusted setup

A trusted setup is a procedure in which secret information is used to generate a piece of data that is necessary for the proper functioning of certain cryptographic protocols. This data, once generated, is then made public and the secret information used to generate it is discarded, so that no further participation from the creators of the ceremony is required.

&#x20;The trust in a trusted setup comes from the fact that only a minimum number of honest people need participate in the ceremony in order to ensure the security of the final output. Trusted setups can have a 1-of-N trust model where only one honest participant is required out of a group.

&#x20;Learn more about trusted setups in here: [https://vitalik.ca/general/2022/03/14/trustedsetup.html](https://vitalik.ca/general/2022/03/14/trustedsetup.html)

&#x20;Verify the files from Semaphore’s [trusted setup ceremony](https://storage.googleapis.com/trustedsetup-a86f4.appspot.com/semaphore/semaphore\_top\_index.html).

&#x20;

&#x20;
