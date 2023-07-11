import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { MnemonicInput } from "@src/ui/components/MnemonicInput";

import { useGenerateMnemonic } from "./useGenerateMnemonic";

const GenerateMnemonic = (): JSX.Element => {
  const { isLoading, error, mnemonic, onSaveMnemonic } = useGenerateMnemonic();

  return (
    <Box
      data-testid="generate-mnemonic-page"
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

        {mnemonic ? <MnemonicInput value={mnemonic} /> : <Skeleton height={175} variant="rectangular" width={337} />}
      </Box>

      <Button
        data-testid="submit-button"
        disabled={isLoading}
        sx={{ textTransform: "none" }}
        type="button"
        variant="contained"
        onClick={onSaveMnemonic}
      >
        Get started!
      </Button>

      {error && (
        <Typography color="error" sx={{ my: 2 }} variant="body1">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default GenerateMnemonic;
