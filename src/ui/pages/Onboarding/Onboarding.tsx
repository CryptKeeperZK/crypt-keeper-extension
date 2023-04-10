import logoSVG from "@src/static/icons/logo.svg";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Icon } from "@src/ui/components/Icon";
import { PasswordInput } from "@src/ui/components/PasswordInput";

import "./onboarding.scss";
import { useOnboarding } from "./useOnboarding";

const Onboarding = (): JSX.Element => {
  const { errors, isLoading, register, onSubmit, isShowPassword, onShowPassword } = useOnboarding();

  return (
    <form className="flex flex-col flex-nowrap h-full onboarding" data-testid="onboarding-form" onSubmit={onSubmit}>
      <div className="flex flex-col items-center flex-grow p-8 onboarding__content">
        <Icon size={8} url={logoSVG} />

        <div className="text-lg pt-8">
          <b>Thanks for using CryptKeeper!</b>
        </div>

        <div className="text-base">To continue, please setup a password</div>

        <div className="py-4 w-full password-input">
          <PasswordInput
            isShowHint
            errorMessage={errors.password}
            id="password"
            isShowPassword={isShowPassword}
            label="Password"
            onShowPassword={onShowPassword}
            {...register("password")}
          />

          <PasswordInput
            isConfirmPasswordInput
            errorMessage={errors.confirmPassword}
            id="confirmPassword"
            isShowPassword={isShowPassword}
            label="Confirm Password"
            {...register("confirmPassword")}
          />
        </div>
      </div>

      {errors.root && <div className="text-red-500 text-sm text-center">{errors.root}</div>}

      <div className="flex flex-row items-center justify-center flex-shrink p-8 onboarding__footer">
        <Button buttonType={ButtonType.PRIMARY} data-testid="submit-button" loading={isLoading} type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
};

export default Onboarding;
