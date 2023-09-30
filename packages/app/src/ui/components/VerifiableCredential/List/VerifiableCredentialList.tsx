import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { VerifiableCredentialItem } from "../Item";

import { useVerifiableCredentialList } from "./useVerifiableCredentialList";

export const VerifiableCredentialList = (): JSX.Element => {
  const { cryptkeeperVCs, onRename, onDelete } = useVerifiableCredentialList();

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
      {cryptkeeperVCs.map(({ vc, metadata }) => (
        <VerifiableCredentialItem
          key={metadata.hash}
          metadata={metadata}
          verifiableCredential={vc}
          onDeleteVC={onDelete}
          onRenameVC={onRename}
        />
      ))}

      {cryptkeeperVCs.length === 0 && (
        <Typography sx={{ my: 2, textAlign: "center" }}>No Verifiable Credentials available</Typography>
      )}
    </Box>
  );
};
