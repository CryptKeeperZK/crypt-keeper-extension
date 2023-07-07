import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { MnemonicInput } from "@src/ui/components/MnemonicInput";

import { useRevealMnemonic } from "./useRevealMnemonic";

const RevealMnemonic = (): JSX.Element => {
  const { error, mnemonic, onGoBack } = useRevealMnemonic();

  return (
    <Box
      data-testid="reveal-mnemonic-page"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, p: 3, position: "relative" }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.5} onClick={onGoBack} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1 }}>
        <Icon size={8} url={logoSVG} />

        <Typography sx={{ mt: 2, textAlign: "center" }} variant="h4">
          Reveal mnemonic
        </Typography>

        <Typography color="error" sx={{ mb: 2, fontWeight: "bold" }} variant="body1">
          We will never ask to show or send mnemonic phrase.
        </Typography>

        <Typography sx={{ my: 1 }} variant="body1">
          Make sure no one is looking at your screen.
        </Typography>

        {mnemonic ? (
          <MnemonicInput data-testid="mnemonic-input" value={mnemonic} />
        ) : (
          <Skeleton height={175} variant="rectangular" width={337} />
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ my: 2 }} variant="body1">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default RevealMnemonic;
