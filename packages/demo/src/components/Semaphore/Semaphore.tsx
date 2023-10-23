import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";
import { MerkleProofType } from "@src/types";

import { ActionBox } from "../ActionBox/ActionBox";

interface ISemaphoreProps {
  genSemaphoreProof: (proofType: MerkleProofType) => void;
}

const SEMAPHORE_CODE = `import { initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const externalNullifier = encodeBytes32String("voting-1"); // Example
const signal = encodeBytes32String("hello-world"); // Example
let merkleProofSource: string | IMerkleProofArtifacts = <HTTP/S_LINK>;

if (proofType === MerkleProofType.ARTIFACTS) {
  merkleProofSource = {
    leaves: mockIdentityCommitments,
    depth: 20,
    leavesPerNode: 2,
  };
}

const genSemaphoreProof = async (
  proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS
) => {
  await client
  ?.request({
    method: RPCExternalAction.GENERATE_SEMAPHORE_PROOF,
    payload: {
      externalNullifier,
      signal,
      merkleProofSource,
    },
  })
  .then((generatedProof) => {
    // SOME CODE
  })
  .catch((error) => {
    // THROW ERROR
  });`;

export const Semaphore = ({ genSemaphoreProof }: ISemaphoreProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Integration with Semaphore</Typography>

      <ActionBox<MerkleProofType, void>
        code={SEMAPHORE_CODE}
        option={MerkleProofType.STORAGE_ADDRESS}
        title="Generate proof from Merkle proof storage address"
        onClick={genSemaphoreProof}
      />

      <ActionBox<MerkleProofType, void>
        code={SEMAPHORE_CODE}
        option={MerkleProofType.ARTIFACTS}
        title="Generate proof from Merkle proof artifacts"
        onClick={genSemaphoreProof}
      />
    </Box>
  );
};
