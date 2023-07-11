import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";

import { Paths } from "@src/constants";
import logoSVG from "@src/static/icons/logo.svg";
import { Icon } from "@src/ui/components/Icon";
import { PasswordInput } from "@src/ui/components/PasswordInput";

import "./login.scss";
import { useLogin } from "./useLogin";

const Login = (): JSX.Element => {
  const { isLoading, errors, register, onSubmit, isShowPassword, onShowPassword } = useLogin();

  return (
    <Box
      className="login"
      component="form"
      data-testid="login-form"
      sx={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", height: "100%" }}
      onSubmit={onSubmit}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3, flexGrow: 1 }}>
        <Icon className="login-icon" url={logoSVG} />

        <Typography sx={{ pt: 3, fontWeight: "bold" }} variant="h4">
          Welcome Back!
        </Typography>

        <Typography variant="body1">To continue, please unlock your wallet</Typography>

        <Box sx={{ width: "100%", py: 2 }}>
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
        </Box>
      </Box>

      <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Button
          data-testid="unlock-button"
          disabled={isLoading}
          sx={{ textTransform: "none", mb: 1 }}
          type="submit"
          variant="contained"
        >
          Unlock
        </Button>

        <Typography component={NavLink} sx={{ color: "primary.main" }} to={Paths.RECOVER}>
          Forgot password?
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
