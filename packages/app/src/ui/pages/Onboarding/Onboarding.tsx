import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { PasswordInput } from "@src/ui/components/PasswordInput";

import "./onboarding.scss";
import { useOnboarding } from "./useOnboarding";

const Onboarding = (): JSX.Element => {
  const { errors, isLoading, register, onSubmit, isShowPassword, onShowPassword, onGoToOnboardingBackup } =
    useOnboarding();

  return (
    <Box
      className="onboarding"
      component="form"
      data-testid="onboarding-form"
      sx={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", height: "100%" }}
      onSubmit={onSubmit}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, p: 3 }}>
        <Icon size={8} url={logoSVG} />

        <Typography sx={{ pt: 3, fontWeight: "bold" }} variant="h4">
          Thanks for using CryptKeeper!
        </Typography>

        <Typography>To continue, please setup a password</Typography>

        <Box sx={{ width: "100%", py: 2 }}>
          <PasswordInput
            autoFocus
            isShowEye
            isShowHint
            errorMessage={errors.password}
            id="password"
            isShowPassword={isShowPassword}
            label="Password"
            onShowPassword={onShowPassword}
            {...register("password")}
          />

          <PasswordInput
            errorMessage={errors.confirmPassword || errors.root}
            id="confirmPassword"
            isShowPassword={isShowPassword}
            label="Confirm Password"
            onShowPassword={onShowPassword}
            {...register("confirmPassword")}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 1,
          p: 3,
        }}
      >
        <Button
          data-testid="submit-button"
          disabled={isLoading}
          sx={{ textTransform: "none", mb: 1 }}
          type="submit"
          variant="contained"
        >
          Continue
        </Button>

        <Button sx={{ color: "primary.main" }} variant="text" onClick={onGoToOnboardingBackup}>
          Have backup?
        </Button>
      </Box>
    </Box>
  );
};

export default Onboarding;
