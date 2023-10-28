import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import ActionBox from "@src/components/ActionBox";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";

const IdentityMetadata = (): JSX.Element => {
    const { getConnectedIdentityMetadata } = useCryptKeeperClient();
    const classes = useGlobalStyles();

    const { fileContent: code } = useFileReader("getConnectedIdentityMetadata.ts");

    return (
        <Container sx={{ flex: 1, position: "relative", top: 64 }}>
            <Box
                className={classes.popup}
                sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            >
                <Typography variant="h6">Get Connected Identity Metadata</Typography>

                <ActionBox<undefined, void>
                    code={code}
                    option={undefined}
                    title="Get Connected Identity"
                    onClick={getConnectedIdentityMetadata}
                />
            </Box>
        </Container>
    );
};

export default IdentityMetadata;
