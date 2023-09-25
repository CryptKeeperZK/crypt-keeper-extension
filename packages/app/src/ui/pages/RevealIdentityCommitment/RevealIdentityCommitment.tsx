import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ReactNode, useCallback } from "react";

import { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { ellipsify } from "@src/util/account";

import { useRevealIdentityCommitment } from "./useRevealIdentityCommitment";

const RevealIdentityCommitment = (): JSX.Element => {
  const { isLoading, error, connectedIdentity, onGoBack, onGoToHost, onReveal } = useRevealIdentityCommitment();

  const renderRow = useCallback(
    (key: string, value?: ReactNode) => (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography fontWeight="bold" variant="h6">
          {key}:
        </Typography>

        {value && (
          <Typography component="div" variant="h6">
            {value}
          </Typography>
        )}
      </Box>
    ),
    [],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          height: "100%",
        }}
      >
        Loading...
      </Box>
    );
  }

  return (
    <Box
      data-testid="reveal-identity-commitment-page"
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <FullModalHeader onClose={onGoBack}>Reveal identity commitment</FullModalHeader>

      <FullModalContent>
        {!connectedIdentity && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography fontWeight="bold" sx={{ textAlign: "center" }} variant="h6">
              No connected identity found
            </Typography>
          </Box>
        )}

        <Box>
          {connectedIdentity && (
            <Box>
              <Typography component="div" fontWeight="bold" variant="h6">
                Reveal identity commitment to
                <Typography
                  component="strong"
                  fontWeight="bold"
                  sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline", ml: 1 }}
                  variant="h6"
                  onClick={onGoToHost}
                >
                  {connectedIdentity.metadata.host}
                </Typography>
              </Typography>

              <Box component="hr" sx={{ my: 2 }} />

              <Box>
                {renderRow(
                  "Commitment",
                  <Tooltip title={connectedIdentity.commitment}>
                    <Typography component="span" variant="h6">
                      {ellipsify(connectedIdentity.commitment)}
                    </Typography>
                  </Tooltip>,
                )}

                {renderRow("Name", connectedIdentity.metadata.name)}

                {renderRow(
                  "Owner account",
                  <Tooltip title={connectedIdentity.metadata.account}>
                    <Typography component="span" variant="h6">
                      {ellipsify(connectedIdentity.metadata.account)}
                    </Typography>
                  </Tooltip>,
                )}
              </Box>

              <Box component="hr" sx={{ my: 2 }} />

              <Typography sx={{ my: 1, color: "warning.main" }} variant="h6">
                Note: disclosure of your identity means that your identity will be known and traceable to identify it
                with you.
              </Typography>
            </Box>
          )}
        </Box>

        {error && (
          <Typography color="error.main" fontSize="xs" sx={{ pb: 1 }} textAlign="center">
            {error}
          </Typography>
        )}
      </FullModalContent>

      <FullModalFooter>
        <Button sx={{ mr: 1, width: "100%" }} variant="outlined" onClick={onGoBack}>
          Reject
        </Button>

        <Button
          color="error"
          data-testid="reveal-identity-commitment"
          disabled={!connectedIdentity}
          sx={{ ml: 1, width: "100%" }}
          variant="contained"
          onClick={onReveal}
        >
          Reveal
        </Button>
      </FullModalFooter>
    </Box>
  );
};

export default RevealIdentityCommitment;
