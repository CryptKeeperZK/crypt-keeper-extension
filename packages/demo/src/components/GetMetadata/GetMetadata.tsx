import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";

import { ActionBox } from "../ActionBox/ActionBox";

import GET_METADATA_CODE from "./codeExported";

interface IGetMetadataProps {
  getConnectedIdentityMetadata: () => void;
}

export const GetMetadata = ({ getConnectedIdentityMetadata }: IGetMetadataProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Get Connected Identity Metadata</Typography>

      <ActionBox<undefined, void>
        code={GET_METADATA_CODE}
        option={undefined}
        title="Get Connected Identity"
        onClick={getConnectedIdentityMetadata}
      />
    </Box>
  );
};
