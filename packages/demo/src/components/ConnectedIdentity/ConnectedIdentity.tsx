import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";

interface IConnectedIdentityProps {
  identityCommitment?: string;
  identityName?: string;
  identityHost?: string;
}

export const ConnectedIdentity = ({
  identityCommitment = "",
  identityName = "",
  identityHost = "",
}: IConnectedIdentityProps): JSX.Element => {
  const classes = useGlobalStyles();

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
            {identityName}
          </Typography>
        </Box>

        {identityHost && (
          <Box>
            <Typography sx={{ pt: 3, fontWeight: "bold", color: "primary.main", alignItems: "center" }} variant="h6">
              <strong>Name: </strong>
            </Typography>
            <Typography className="identity-name" color="text.primary" data-testid="connected-urlOrigin">
              {identityHost}
            </Typography>
          </Box>
        )}

        <Box>
          <Typography sx={{ pt: 3, fontWeight: "bold", color: "primary.main", alignItems: "center" }} variant="h6">
            <strong>Commitment: </strong>
          </Typography>
          {identityCommitment ? (<Typography className="identity-name" color="text.primary" data-testid="commitment">
            {identityCommitment}
          </Typography>) : (<Typography className="identity-name" color="text.primary" data-testid="commitment">
            You need to ask to reveal identity Commitment
          </Typography>)}
        </Box>
      </Box>
    </Box>
  );
};
