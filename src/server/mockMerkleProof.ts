import { BigNumberish } from "@semaphore-protocol/group";
import { Identity } from "@semaphore-protocol/identity";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { bigintToHex, hexToBigint } from "bigint-conversion";
import cors from "cors";
import express, { Request as ExpressRequest } from "express";
import log from "loglevel";

import { generateMerkleProof } from "../background/services/protocols/utils";

const DEPTH_RLN = 15;
const DEPTH_SEMAPHORE = 20;

const app = express();
app.use(express.json());
app.use(cors());

const serializeMerkleProof = (merkleProof: MerkleProof): MerkleProof => ({
  root: bigintToHex(merkleProof.root as bigint),
  siblings: merkleProof.siblings.map((siblings) =>
    Array.isArray(siblings)
      ? siblings.map((element) => bigintToHex(element as bigint))
      : bigintToHex(siblings as bigint),
  ),
  pathIndices: merkleProof.pathIndices,
  leaf: bigintToHex(merkleProof.leaf as bigint),
});

const identityCommitments: BigNumberish[] = [];

for (let i = 0; i < 2; i += 1) {
  const mockIdentity = new Identity();
  identityCommitments.push(mockIdentity.getCommitment());
}

app.post(
  "/merkleProof/:type",
  (req: ExpressRequest<{ type: string }, unknown, { identityCommitment: string }>, res) => {
    const { type } = req.params;
    const { identityCommitment } = req.body;
    const commitment = hexToBigint(identityCommitment);

    if (!identityCommitments.includes(commitment)) {
      identityCommitments.push(commitment);
    }

    try {
      const merkleProof =
        type === "RLN"
          ? generateMerkleProof({ treeDepth: DEPTH_RLN, member: commitment, members: identityCommitments })
          : generateMerkleProof({
              treeDepth: DEPTH_SEMAPHORE,
              member: commitment,
              members: identityCommitments,
            });

      const serializedMerkleProof = serializeMerkleProof(merkleProof);
      log.debug("Sending proof with root: ", serializedMerkleProof.root);
      res.send({ data: { merkleProof: serializedMerkleProof } });
    } catch (error) {
      log.debug("Merkle proof error", error);
      res.status(400).send({ error: "can't generate proof" });
    }
  },
);

app.listen(8090, () => {
  log.debug("Merkle service is listening");
});
