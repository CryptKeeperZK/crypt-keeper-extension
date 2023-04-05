import { Tooltip } from "@mui/material";
import logoSVG from "@src/static/icons/logo.svg";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import { useShowPassword } from "@src/ui/hooks/showPassword";

import "./login.scss";
import { useLogin } from "./useLogin";

const Login = (): JSX.Element => {
  const { isLoading, errors, register, onSubmit } = useLogin();
  const { isShowPassword, setShowPassword } = useShowPassword();

  return (
    <form className="flex flex-col flex-nowrap h-full login" data-testid="login-form" onSubmit={onSubmit}>
      <div className="flex flex-col items-center flex-grow p-8 login__content">
        <Icon url={logoSVG} />

        <div className="text-lg pt-8">
          <b>Welcome Back!</b>
        </div>

        <div className="text-base">To continue, please unlock your wallet</div>

        <div className="py-8 w-full">
          <Input
            autoFocus
            className="mb-4"
            icon={[isShowPassword ? (
              <Tooltip
                key={2}
                className="eye-tooltip"
                data-testid="eye-slash-button"
                title="Hide Password"
                onClick={setShowPassword}
              >
                <Icon className="eye-icon" fontAwesome="fa-eye-slash" />
              </Tooltip>
            ) : (
              <Tooltip
                key={2}
                className="eye-tooltip"
                data-testid="eye-look-button"
                title="Show Password"
                onClick={setShowPassword}
              >
                <Icon className="eye-icon" fontAwesome="fa-eye" />
              </Tooltip>
            ),]}
            id="password"
            label="Password"
            type={isShowPassword ? "text" : "password"}
            {...register("password", { required: "Password is required" })}
          />
        </div>
      </div>

      {errors.password && <div className="text-red-500 text-sm text-center">{errors.password}</div>}

      <div className="flex flex-row items-center justify-center flex-shrink p-8 login__footer">
        <Button buttonType={ButtonType.PRIMARY} data-testid="unlock-button" loading={isLoading} type="submit">
          Unlock
        </Button>
      </div>
    </form>
  );
};

export default Login;
