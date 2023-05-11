import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { RevealMnemonicInput } from "@src/ui/components/RevealMnemonicInput";

import { useMnemonic } from "./useMnemonic";

const Mnemonic = (): JSX.Element => {
  const { mnemonic, onGoHome } = useMnemonic();

  return (
    <Box
      data-testid="mnemonic-page"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, p: 3 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1 }}>
        <Icon size={8} url={logoSVG} />

        <Typography sx={{ mt: 2 }} variant="h4">
          One step left!
        </Typography>

        <Typography sx={{ mt: 1, mb: 2 }} variant="body1">
          Please keep your mnemonic phrase safely
        </Typography>

        <RevealMnemonicInput mnemonic={mnemonic} />
      </Box>

      <Button
        data-testid="submit-button"
        sx={{ textTransform: "none" }}
        type="button"
        variant="contained"
        onClick={onGoHome}
      >
        Get started!
      </Button>
    </Box>
  );
};

export default Mnemonic;
