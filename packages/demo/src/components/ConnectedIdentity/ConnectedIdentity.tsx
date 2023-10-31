import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";

interface IConnectedIdentityProps {
  commitment?: string;
  name?: string;
}

export const ConnectedIdentity = ({ commitment = "", name = "" }: IConnectedIdentityProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
    <Box
      className={classes.popup}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        flexWrap: "nowrap",
        borderBottom: "1px solid",
        borderColor: "text.800",
        border: "2px solid $gray-800",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3, flexGrow: 1 }}>
        <AccountCircleIcon color="primary" fontSize="inherit" />

        <Typography sx={{ pt: 3, fontWeight: "bold", color: "primary.main", alignItems: "center" }} variant="h5">
          CryptKeeper Connected Identity
        </Typography>
      </Box>

      <Box>
        <Box>
          <Typography className="identity-name" color="text.primary" data-testid="connected-name">
            <strong>Name: </strong>

            {name}
          </Typography>
        </Box>

        {commitment ? (
          <Typography className="identity-name" color="text.primary" data-testid="commitment">
            <strong>Commitment: </strong>

            {commitment}
          </Typography>
        ) : (
          <Typography className="identity-name" color="text.primary" data-testid="commitment">
            You need to ask to reveal identity Commitment
          </Typography>
        )}
      </Box>
    </Box>
  );
};
