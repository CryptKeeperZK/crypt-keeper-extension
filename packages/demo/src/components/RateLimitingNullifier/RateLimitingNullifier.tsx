import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";
import { MerkleProofType } from "@src/types";

import { ActionBox } from "../ActionBox/ActionBox";

interface IRateLimitingNullifierProps {
  genRLNProof: (proofType: MerkleProofType) => void;
}

const RLN_CODE = `import { initializeCryptKeeper, 
  RPCExternalAction 
} from "@cryptkeeperzk/providers";

import type {
  IMerkleProofArtifacts,
  IRLNFullProof,
  ConnectedIdentityMetadata,
} from "@cryptkeeperzk/types";

const client = initializeCryptKeeper();

const rlnIdentifier = "1"; // Example
const message = "Hello RLN"; // Example
const messageLimit = 1; // Example
const messageId = 0; // Example
const epoch = Date.now().toString(); // Example
let merkleProofSource: string | IMerkleProofArtifacts = <HTTP/S_LINK>;

if (proofType === MerkleProofType.ARTIFACTS) {
  merkleProofSource = {
    leaves: mockIdentityCommitments,
    depth: 15,
    leavesPerNode: 2,
  };
}

const genRLNProof = async (
  proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS
) => {
  await client
  ?.request({
    method: RPCExternalAction.GENERATE_RLN_PROOF,
    payload: {
      rlnIdentifier,
      message,
      messageId,
      messageLimit,
      epoch,
      merkleProofSource,
    },
  })
  .then((generatedProof) => {
    // SOME CODE
  })
  .catch((error) => {
    // THROW ERROR
  });`;

export const RateLimitingNullifier = ({ genRLNProof }: IRateLimitingNullifierProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Integration with Rate-Limiting Nullifier (RLN)</Typography>

      <ActionBox<MerkleProofType, void>
        code={RLN_CODE}
        option={MerkleProofType.STORAGE_ADDRESS}
        title="Generate proof from Merkle proof storage address"
        onClick={genRLNProof}
      />

      <ActionBox<MerkleProofType, void>
        code={RLN_CODE}
        option={MerkleProofType.ARTIFACTS}
        title="Generate proof from Merkle proof artifacts"
        onClick={genRLNProof}
      />
    </Box>
  );
};
