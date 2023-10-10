import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { PasswordInput } from "@src/ui/components/PasswordInput";

import { useResetPassword } from "./useResetPassword";

const ResetPassword = (): JSX.Element => {
  const { errors, isLoading, register, onSubmit, isShowPassword, onShowPassword, onClose } = useResetPassword();

  return (
    <Box
      component="form"
      data-testid="reset-password-page"
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, position: "relative", p: 3 }}
      onSubmit={onSubmit}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.5} onClick={onClose} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, width: "100%" }}>
        <Icon size={8} url={logoSVG} />

        <Typography sx={{ mt: 2, fontWeight: "bold", color: "primary.main" }} variant="h4">
          Reset password
        </Typography>

        <Typography sx={{ mt: 1, color: "white" }} variant="body2">
          To continue, please setup a new password
        </Typography>

        <Box sx={{ py: 2, width: "100%" }}>
          <PasswordInput
            autoFocus
            isShowEye
            isShowHint
            errorMessage={errors.password}
            id="password"
            isShowPassword={isShowPassword}
            label="Password"
            variant="filled"
            onShowPassword={onShowPassword}
            {...register("password")}
          />

          <PasswordInput
            errorMessage={errors.confirmPassword || errors.root}
            id="confirmPassword"
            isShowPassword={isShowPassword}
            label="Confirm Password"
            variant="filled"
            onShowPassword={onShowPassword}
            {...register("confirmPassword")}
          />
        </Box>
      </Box>

      <Button
        data-testid="submit-button"
        disabled={isLoading}
        sx={{ textTransform: "none" }}
        type="submit"
        variant="contained"
      >
        Reset
      </Button>
    </Box>
  );
};

export default ResetPassword;
