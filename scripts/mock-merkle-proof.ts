// eslint-disable-next-line import/no-extraneous-dependencies
import express from "express";
import { Identity } from "@semaphore-protocol/identity";
import { Member } from "@semaphore-protocol/group";
import { bigintToHex, hexToBigint } from "bigint-conversion";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import log from "loglevel";

import { generateMerkleProof } from "../src/background/services/protocols/utils";

const DEPTH_RLN = 15;
const NUMBER_OF_LEAVES_RLN = 2;
const DEPTH_SEMAPHORE = 20;
const NUMBER_OF_LEAVES_SEMAPHORE = 2;
const ZERO_VALUE = BigInt(0);

const serializeMerkleProof = (merkleProof: MerkleProof) => {
  const serialized: Partial<MerkleProof> = {};
  serialized.root = bigintToHex(merkleProof.root);
  serialized.siblings = merkleProof.siblings.map(siblings =>
    Array.isArray(siblings) ? siblings.map(element => bigintToHex(element)) : bigintToHex(siblings),
  );
  serialized.pathIndices = merkleProof.pathIndices;
  serialized.leaf = bigintToHex(merkleProof.leaf);
  return serialized;
};

const generateMerkleProofRLN = (_identityCommitments: Member[], identityCommitment: Member) => {
  return generateMerkleProof(DEPTH_RLN, identityCommitment);

  // return generateMerkleProof(DEPTH_RLN, ZERO_VALUE, NUMBER_OF_LEAVES_RLN, identityCommitments, identityCommitment)
};

const generateMerkleProofSemaphore = (_identityCommitments: Member[], identityCommitment: Member) => {
  return generateMerkleProof(DEPTH_SEMAPHORE, identityCommitment);

  // return generateMerkleProof(
  //     DEPTH_SEMAPHORE,
  //     ZERO_VALUE,
  //     NUMBER_OF_LEAVES_SEMAPHORE,
  //     identityCommitments,
  //     identityCommitment
  // )
};

const identityCommitments: Member[] = [];

// eslint-disable-next-line no-plusplus
for (let i = 0; i < 2; i++) {
  const mockIdentity = new Identity();
  identityCommitments.push(mockIdentity.generateCommitment());
}

const app = express();
app.use(express.json());

app.post("/merkleProof/:type", (req, res) => {
  let type = req.params.type;
  let { identityCommitment } = req.body;
  identityCommitment = hexToBigint(identityCommitment);

  if (!identityCommitments.includes(identityCommitment)) {
    identityCommitments.push(identityCommitment);
  }
  const merkleProof =
    type === "RLN"
      ? generateMerkleProofRLN(identityCommitments, identityCommitment)
      : generateMerkleProofSemaphore(identityCommitments, identityCommitment);

  const serializedMerkleProof = serializeMerkleProof(merkleProof);
  log.debug("Sending proof with root: ", serializedMerkleProof.root);
  res.send({ merkleProof: serializedMerkleProof });
});

app.listen(8090, () => {
  log.debug("Merkle service is listening");
});
