import "./globals";

import express from "express";
import cors from "cors";
import { Identity } from "@semaphore-protocol/identity";
import { BigNumberish } from "@semaphore-protocol/group";
import { bigintToHex, hexToBigint } from "bigint-conversion";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import log from "loglevel";

import { generateMerkleProof } from "../background/services/protocols/utils";

const DEPTH_RLN = 15;
const DEPTH_SEMAPHORE = 20;

const app = express();
app.use(express.json());
app.use(cors());

const serializeMerkleProof = (merkleProof: MerkleProof): MerkleProof => ({
  root: bigintToHex(merkleProof.root),
  siblings: merkleProof.siblings.map((siblings) =>
    Array.isArray(siblings) ? siblings.map((element) => bigintToHex(element)) : bigintToHex(siblings),
  ),
  pathIndices: merkleProof.pathIndices,
  leaf: bigintToHex(merkleProof.leaf),
});

const identityCommitments: BigNumberish[] = [];

for (let i = 0; i < 2; i++) {
  const mockIdentity = new Identity();
  identityCommitments.push(mockIdentity.getCommitment());
}

app.post("/merkleProof/:type", (req, res) => {
  const { type } = req.params;
  let { identityCommitment } = req.body;
  identityCommitment = hexToBigint(identityCommitment);

  if (!identityCommitments.includes(identityCommitment)) {
    identityCommitments.push(identityCommitment);
  }

  try {
    const merkleProof =
      type === "RLN"
        ? generateMerkleProof({ treeDepth: DEPTH_RLN, member: identityCommitment, members: identityCommitments })
        : generateMerkleProof({ treeDepth: DEPTH_SEMAPHORE, member: identityCommitment, members: identityCommitments });

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
