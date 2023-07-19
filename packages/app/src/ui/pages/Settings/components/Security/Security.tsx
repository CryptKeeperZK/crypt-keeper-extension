import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";

export interface ISecurityProps {
  isLoading: boolean;
  onGoToResetPassword: () => void;
  onGoRevealMnemonic: () => void;
}

const Security = ({ isLoading, onGoRevealMnemonic, onGoToResetPassword }: ISecurityProps): JSX.Element => {
  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box data-testid="security-settings">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Mnemonic phrase</Typography>

        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">
          This mnemonic phrase provides full access to your data and wallet. Make sure no one is looking at your screen.
          We will never ask to show or send mnemonic phrase.
        </Typography>

        <FormGroup sx={{ mt: 2 }}>
          <Button
            color="error"
            data-testid="reveal-mnemonic"
            sx={{ textTransform: "none", width: 200 }}
            variant="contained"
            onClick={onGoRevealMnemonic}
          >
            Reveal mnemonic
          </Button>
        </FormGroup>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Change password</Typography>

        <Typography color="text.secondary" variant="body2">
          You can change your password with mnemonic phrase
        </Typography>

        <FormGroup sx={{ mt: 2 }}>
          <Button
            data-testid="change-password"
            sx={{ textTransform: "none", width: 200 }}
            variant="contained"
            onClick={onGoToResetPassword}
          >
            Change password
          </Button>
        </FormGroup>
      </Box>
    </Box>
  );
};

export default Security;
