import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";

export const ConnectedIdentity = (): JSX.Element => {
  const { connectedCommitment, connectedIdentityMetadata } = useCryptKeeperClient();

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        flexWrap: "nowrap",
      }}
    >
      <Box>
        <Typography sx={{ pt: 3, fontWeight: "bold", color: "primary.main", alignItems: "center" }} variant="h5">
          CryptKeeper Connected Identity
        </Typography>

        <Box>
          <Typography sx={{ pt: 3, fontWeight: "bold", color: "primary.main", alignItems: "center" }} variant="h6">
            <strong>Name: </strong>
          </Typography>
          <Typography className="identity-name" color="text.primary" data-testid="connected-name">
            {connectedIdentityMetadata?.name}
          </Typography>
        </Box>

        {connectedIdentityMetadata?.urlOrigin && (
          <Box>
            <Typography sx={{ pt: 3, fontWeight: "bold", color: "primary.main", alignItems: "center" }} variant="h6">
              <strong>Name: </strong>
            </Typography>
            <Typography className="identity-name" color="text.primary" data-testid="connected-urlOrigin">
              {connectedIdentityMetadata.urlOrigin}
            </Typography>
          </Box>
        )}

        <Box>
          <Typography sx={{ pt: 3, fontWeight: "bold", color: "primary.main", alignItems: "center" }} variant="h6">
            <strong>Commitment: </strong>
          </Typography>
          {connectedCommitment ? (
            <Typography className="identity-name" color="text.primary" data-testid="commitment">
              {connectedCommitment}
            </Typography>
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
