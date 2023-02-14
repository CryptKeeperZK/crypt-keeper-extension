// eslint-disable-next-line import/no-extraneous-dependencies
import express from "express";
import { Identity } from "@semaphore-protocol/identity";
import { Member } from "@semaphore-protocol/group";
import { bigintToHex, hexToBigint } from "bigint-conversion";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import log from "loglevel";

import { generateMerkleProof } from "../src/background/services/protocols/utils";

const DEPTH_RLN = 15;
const DEPTH_SEMAPHORE = 20;

if (!global.atob) {
  global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
}

if (!global.btoa) {
  global.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
}

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
  return generateMerkleProof({ treeDepth: DEPTH_RLN, member: identityCommitment, members: _identityCommitments });
};

const generateMerkleProofSemaphore = (_identityCommitments: Member[], identityCommitment: Member) => {
  return generateMerkleProof({ treeDepth: DEPTH_SEMAPHORE, member: identityCommitment, members: _identityCommitments });
};

const identityCommitments: Member[] = [];

for (let i = 0; i < 2; i++) {
  const mockIdentity = new Identity();
  identityCommitments.push(mockIdentity.getCommitment());
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

  try {
    const merkleProof =
      type === "RLN"
        ? generateMerkleProofRLN(identityCommitments, identityCommitment)
        : generateMerkleProofSemaphore(identityCommitments, identityCommitment);

    const serializedMerkleProof = serializeMerkleProof(merkleProof);
    log.debug("Sending proof with root: ", serializedMerkleProof.root);
    res.send({ data: { merkleProof: serializedMerkleProof } });
  } catch (error) {
    log.debug("Merkle proof error", error);
    res.status(400).send({ error: "can't generate proof" });
  }
});

app.listen(8090, () => {
  log.debug("Merkle service is listening");
});
