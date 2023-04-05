import Tooltip from "@mui/material/Tooltip";

import logoSVG from "@src/static/icons/logo.svg";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import { useShowPassword } from "@src/ui/hooks/showPassword";

import "./onboarding.scss";
import { useOnboarding } from "./useOnboarding";

const Onboarding = (): JSX.Element => {
  const { errors, isLoading, register, onSubmit } = useOnboarding();
  const { isShowPassword, setShowPassword } = useShowPassword();

  return (
    <form className="flex flex-col flex-nowrap h-full onboarding" data-testid="onboarding-form" onSubmit={onSubmit}>
      <div className="flex flex-col items-center flex-grow p-8 onboarding__content">
        <Icon size={8} url={logoSVG} />

        <div className="text-lg pt-8">
          <b>Thanks for using CryptKeeper!</b>
        </div>

        <div className="text-base">To continue, please setup a password</div>

        <div className="py-4 w-full" data-testid="showen-inputs">
          <Input
            autoFocus
            className="mb-4"
            errorMessage={errors.password}
            icon={[
              <Tooltip
                key={1}
                className="info-tooltip"
                title={
                  <div>
                    <p>Password requirements:</p>

                    <p>- At least 8 characters</p>

                    <p>- At least 1 upper case and letter</p>

                    <p>- At least 1 lower case letter</p>

                    <p>- At least 1 special character (!@#$%^&*)</p>

                    <p>- At least 1 number</p>
                  </div>
                }
              >
                <Icon className="info-icon" fontAwesome="fa-info" />
              </Tooltip>,
              isShowPassword ? (
                <Tooltip
                  key={2}
                  className="eye-tooltip"
                  data-testid="eye-slash-button"
                  title="Hide Password"
                  onClick={setShowPassword}
                >
                  <Icon className="info-icon" fontAwesome="fa-eye-slash" />
                </Tooltip>
              ) : (
                <Tooltip
                  key={2}
                  className="eye-tooltip"
                  data-testid="eye-look-button"
                  title="Show Password"
                  onClick={setShowPassword}
                >
                  <Icon className="info-icon" fontAwesome="fa-eye" />
                </Tooltip>
              ),
            ]}
            id="password"
            label="Password"
            type={isShowPassword ? "text" : "password"}
            {...register("password")}
          />

          <Input
            errorMessage={errors.confirmPassword}
            id="confirmPassword"
            label="Confirm Password"
            type={isShowPassword ? "text" : "password"}
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
