import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { MnemonicInput } from "@src/ui/components/MnemonicInput";

import "./recover.scss";
import { useRecover } from "./useRecover";

const Recover = (): JSX.Element => {
  const { isLoading, errors, register, onSubmit, onClose } = useRecover();

  return (
    <Box
      className="recover"
      component="form"
      data-testid="recover-page"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, position: "relative", p: 3 }}
      onSubmit={onSubmit}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.5} onClick={onClose} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1 }}>
        <Icon className="recover-icon" size={8} url={logoSVG} />

        <Typography sx={{ mt: 2, fontWeight: "bold", color: "primary.main" }} variant="h4">
          Recover access
        </Typography>

        <Typography sx={{ mt: 1, color: "white" }} variant="body2">
          If you are having trouble unlocking your account, you will need to reset your wallet. You can do this by
          providing the Mnemonic Phrase you used when you set up your wallet.
        </Typography>

        <Typography sx={{ mt: 1, mb: 1, color: "white" }} variant="body2">
          This action will delete your current wallet and Mnemonic Phrase from this device, along with the data.
        </Typography>

        <MnemonicInput
          autoFocus
          hideOptions
          data-testid="mnemonic-input"
          errorMessage={errors.mnemonic || errors.root}
          id="mnemonic"
          placeholder="Enter mnemonic"
          rows={3}
          sx={{ mb: 2 }}
          {...register("mnemonic")}
        />
      </Box>

      <Button
        data-testid="submit-button"
        disabled={isLoading}
        sx={{ textTransform: "none" }}
        type="submit"
        variant="contained"
      >
        Restore
      </Button>
    </Box>
  );
};

export default Recover;
