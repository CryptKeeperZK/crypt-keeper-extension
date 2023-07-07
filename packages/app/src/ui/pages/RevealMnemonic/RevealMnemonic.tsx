import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { MnemonicInput } from "@src/ui/components/MnemonicInput";
import { PasswordInput } from "@src/ui/components/PasswordInput";

import { useRevealMnemonic } from "./useRevealMnemonic";

const RevealMnemonic = (): JSX.Element => {
  const { isLoading, isShowPassword, errors, mnemonic, register, onGoBack, onShowPassword, onSubmit } =
    useRevealMnemonic();

  return (
    <Box
      data-testid="reveal-mnemonic-page"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexGrow: 1,
        p: 3,
        pb: 0,
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.5} onClick={onGoBack} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1 }}>
        <Icon size={8} url={logoSVG} />

        <Typography sx={{ mt: 2, textAlign: "center" }} variant="h4">
          Reveal mnemonic
        </Typography>

        <Typography color="error" sx={{ my: 1, fontWeight: "bold", textAlign: "center" }} variant="body1">
          We will never ask to show or send mnemonic phrase.
        </Typography>

        <Typography sx={{ mb: 2, textAlign: "center" }} variant="body1">
          Make sure no one is looking at your screen.
        </Typography>

        {!mnemonic ? (
          <Box
            component="form"
            data-testid="mnemonic-password-form"
            sx={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", height: "100%", width: "100%" }}
            onSubmit={onSubmit}
          >
            <PasswordInput
              autoFocus
              isShowEye
              errorMessage={errors.password}
              id="password"
              isShowPassword={isShowPassword}
              label="Password"
              onShowPassword={onShowPassword}
              {...register("password", { required: "Password is required" })}
            />

            <Button
              color="error"
              data-testid="unlock-button"
              disabled={isLoading}
              sx={{ textTransform: "none", mt: "auto" }}
              type="submit"
              variant="contained"
            >
              Unlock
            </Button>

            <Typography color="error" sx={{ my: 2, height: 24, textAlign: "center" }} variant="body1">
              {errors.root}
            </Typography>
          </Box>
        ) : (
          <MnemonicInput data-testid="mnemonic-input" value={mnemonic} />
        )}
      </Box>
    </Box>
  );
};

export default RevealMnemonic;
