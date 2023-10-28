import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import ActionBox from "@src/components/ActionBox";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";
import { useSemaphore } from "./useSemaphore";
import { MerkleProofType } from "@src/types";
import DisplayProof from "@src/components/DisplayProof";

export const Semaphore = (): JSX.Element => {
    const classes = useGlobalStyles();
    const { proof, genSemaphoreProof } = useSemaphore();

    const { fileContent: code } = useFileReader("semaphore.ts");

    return (
        <Container sx={{ flex: 1, position: "relative", top: 64 }}>
            <Box
                className={classes.popup}
                sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
                <Typography variant="h6">Integration with Semaphore</Typography>

                <ActionBox<MerkleProofType, void>
                    code={code}
                    option={MerkleProofType.STORAGE_ADDRESS}
                    title="Generate proof from Merkle proof storage address"
                    onClick={genSemaphoreProof}
                />

                <ActionBox<MerkleProofType, void>
                    code={code}
                    option={MerkleProofType.ARTIFACTS}
                    title="Generate proof from Merkle proof artifacts"
                    onClick={genSemaphoreProof}
                />

                <DisplayProof proof={proof} />
            </Box>
        </Container>
    );
};

export default Semaphore;
