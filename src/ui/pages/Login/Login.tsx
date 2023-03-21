import { ButtonType, Button } from "@src/ui/components/Button";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";

import logoSVG from "../../../static/icons/logo.svg";

import "./login.scss";
import { useLogin } from "./useLogin";

export const Login = (): JSX.Element => {
  const { password, isLoading, error, onChangePassword, onSubmit } = useLogin();

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
            disabled={isLoading}
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={onChangePassword}
          />
        </div>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex flex-row items-center justify-center flex-shrink p-8 login__footer">
        <Button
          buttonType={ButtonType.PRIMARY}
          data-testid="unlock-button"
          disabled={!password}
          loading={isLoading}
          type="submit"
        >
          Unlock
        </Button>
      </div>
    </form>
  );
};
