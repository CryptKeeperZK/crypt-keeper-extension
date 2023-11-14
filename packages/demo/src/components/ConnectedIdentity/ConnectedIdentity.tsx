import { CheckCircleOutline, FileCopyOutlined, PowerOffOutlined, PowerOutlined } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";

import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { sharedStyles, useGlobalStyles } from "@src/styles/useGlobalStyles";
import { ellipsify } from "@src/utils";
import { useTheme } from "@mui/styles";

export const ConnectedIdentity = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);
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
      <Box className={classes.connectedIdentity}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Typography alignItems="center" color="primary" display="flex" mb={2} variant="subtitle1">
              <PlayCircleFilledIcon sx={{ color: "primary.main", mr: 1 }} /> Demo
            </Typography>
          </Box>

          <Typography alignItems="center" color="primary" display="flex" mb={2} variant="subtitle1">
            <PowerOffOutlined sx={{ color: "primary.main", mr: 1 }} /> Not Connected
          </Typography>
        </Box>

        <Typography color="text.primary" mb={2} variant="body1">
          Not connected yet, please head to the demo and begin the connection process with CryptKeeper to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.connectedIdentity}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Typography alignItems="center" color="primary" display="flex" mb={2} variant="subtitle1">
            <PlayCircleFilledIcon sx={{ color: "primary.main", mr: 1 }} /> Demo
          </Typography>
        </Box>

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
              You need to send a request to reveal identity commitment.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
