import { CheckCircleOutline, FileCopyOutlined, PowerOffOutlined, PowerOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { sharedStyles } from "@src/styles/useGlobalStyles";
import { ellipsify } from "@src/utils";

export const ConnectedIdentity = (): JSX.Element => {
  const { isConnected, connectedCommitment, connectedIdentityMetadata } = useCryptKeeperClient();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(connectedCommitment);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  if (!isConnected) {
    return (
      <Box
        sx={{
          p: 2,
          border: 1,
          borderColor: "primary.main",
          borderRadius: 2,
          width: sharedStyles.sideBarWidth * 0.9,
          position: "fixed",
          top: 64,
          mx: "auto",
        }}
      >
        <Box>
          <Typography alignItems="center" color="primary" display="flex" mb={2} variant="subtitle1">
            <PowerOffOutlined sx={{ color: "primary.main", mr: 1 }} /> Not Connected
          </Typography>
        </Box>

        <Typography color="text.primary" mb={2} variant="body1">
          No connected identity found. Please connect with CryptKeeper to get started with the demo.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: "primary.main",
        borderRadius: 2,
        width: sharedStyles.sideBarWidth * 0.9,
        position: "fixed",
        top: 64,
        mx: "auto",
      }}
    >
      <Box>
        <Typography alignItems="center" color="primary" display="flex" mb={2} variant="subtitle1">
          <PowerOutlined sx={{ color: "primary.main", mr: 1 }} /> Connected
        </Typography>

        <Box>
          <Typography color="primary.main" mb={1} variant="body1">
            <strong>Name: </strong>
          </Typography>

          <Typography className="identity-name" color="text.primary" data-testid="connected-name">
            {connectedIdentityMetadata?.name}
          </Typography>
        </Box>

        {connectedIdentityMetadata?.urlOrigin && (
          <Box>
            <Typography color="primary.main" mb={1} variant="body1">
              <strong>Host: </strong>
            </Typography>

            <Typography className="identity-name" color="text.primary" data-testid="connected-urlOrigin">
              {connectedIdentityMetadata.urlOrigin}
            </Typography>
          </Box>
        )}

        <Box>
          <Typography color="primary.main" mb={1} variant="body1">
            <strong>Commitment: </strong>
          </Typography>

          {connectedCommitment ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip arrow title={isCopied ? "Copied!" : "Copy"}>
                <FileCopyOutlined
                  color="primary"
                  style={{ cursor: "pointer", marginRight: 5 }}
                  onClick={handleCopyClick}
                />
              </Tooltip>

              <Tooltip arrow title={isCopied ? "Copied!" : connectedCommitment}>
                <Typography
                  className="identity-name"
                  color="text.primary"
                  data-testid="commitment"
                  style={{ cursor: "pointer" }}
                  onClick={handleCopyClick}
                >
                  {isCopied ? (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      Copied! <CheckCircleOutline style={{ marginLeft: 5, fontSize: 20 }} />
                    </span>
                  ) : (
                    ellipsify(connectedCommitment)
                  )}
                </Typography>
              </Tooltip>
            </Box>
          ) : (
            <Typography className="identity-name" color="text.primary" data-testid="commitment">
              You need to ask to reveal identity Commitment
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
