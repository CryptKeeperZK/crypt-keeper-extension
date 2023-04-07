import { InputAdornment, Tooltip } from "@mui/material";

import logoSVG from "@src/static/icons/logo.svg";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import { PasswordInput } from "@src/ui/components/PasswordInput";
import { useShowPassword } from "@src/ui/hooks/showPassword";

import "./login.scss";
import { useLogin } from "./useLogin";

const Login = (): JSX.Element => {
  const { isLoading, errors, register, onSubmit } = useLogin();

  return (
    <form className="flex flex-col flex-nowrap h-full login" data-testid="login-form" onSubmit={onSubmit}>
      <div className="flex flex-col items-center flex-grow p-8 login__content">
        <Icon url={logoSVG} />

        <div className="text-lg pt-8">
          <b>Welcome Back!</b>
        </div>

        <div className="text-base">To continue, please unlock your wallet</div>

        <PasswordInput
          isShowInfo={false}
          isShowConfirmPassword={false}
          register={register}
          errors={errors}
        />
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
