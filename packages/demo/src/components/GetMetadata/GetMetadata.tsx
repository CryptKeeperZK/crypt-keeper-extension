import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

interface IGetMetadataProps {
  getConnectedIdentityMetadata: () => void;
}

export const GetMetadata = ({ getConnectedIdentityMetadata }: IGetMetadataProps): JSX.Element => {
  const classes = useGlobalStyles();
  const { fileContent: code } = useFileReader("getConnectedIdentityMetadata.ts");

  return (
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
  );
};
