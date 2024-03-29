import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { VerifiableCredentialItem } from "../Item";

import { useVerifiableCredentialList } from "./useVerifiableCredentialList";

export const VerifiableCredentialList = (): JSX.Element => {
  const { cryptkeeperVerifiableCredentials, onRenameVerifiableCredential, onDeleteVerifiableCredential } =
    useVerifiableCredentialList();

  return (
    <Box
      sx={{
        overflowX: "hidden",
        overflowY: "auto",
        top: 56,
        bottom: 56,
        position: "absolute",
        width: "100%",
        scrollbarWidth: "none",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",

        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {cryptkeeperVerifiableCredentials.map(({ verifiableCredential, metadata }) => (
        <VerifiableCredentialItem
          key={metadata.hash}
          metadata={metadata}
          verifiableCredential={verifiableCredential}
          onDeleteVerifiableCredential={onDeleteVerifiableCredential}
          onRenameVerifiableCredential={onRenameVerifiableCredential}
        />
      ))}

      {cryptkeeperVerifiableCredentials.length === 0 && (
        <Typography sx={{ my: 2, textAlign: "center" }}>No Verifiable Credentials available</Typography>
      )}
    </Box>
  );
};
