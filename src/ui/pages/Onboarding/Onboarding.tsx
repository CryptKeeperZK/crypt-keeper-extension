import Tooltip from "@mui/material/Tooltip";

import logoSVG from "@src/static/icons/logo.svg";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";

import "./onboarding.scss";
import { useOnboarding } from "./useOnboarding";

const Onboarding = (): JSX.Element => {
  const { errors, isLoading, register, onSubmit, eyeLook, onEyeLook, onEyeSlash } = useOnboarding();

  return (
    <form className="flex flex-col flex-nowrap h-full onboarding" data-testid="onboarding-form" onSubmit={onSubmit}>
      <div className="flex flex-col items-center flex-grow p-8 onboarding__content">
        <Icon size={8} url={logoSVG} />

        <div className="text-lg pt-8">
          <b>Thanks for using CryptKeeper!</b>
        </div>

        <div className="text-base">To continue, please setup a password</div>

        {eyeLook ? (
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
                <Tooltip
                  key={2}
                  className="eye-slash-tooltip"
                  title="Hide Password"
                  data-testid="eye-slash-button"
                  onClick={onEyeSlash}
                >
                  <Icon className="eye-slash-icon" fontAwesome="fa-eye-slash" />
                </Tooltip>,
              ]}
              id="password"
              label="Password"
              type="text"
              {...register("password")}
            />

            <Input
              errorMessage={errors.confirmPassword}
              id="confirmPassword"
              label="Confirm Password"
              type="text"
              {...register("confirmPassword")}
            />
          </div>
        ) : (
          <div className="py-4 w-full" data-testid="hidden-inputs">
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
                <Tooltip
                  key={2}
                  className="eye-tooltip"
                  title="Show Password"
                  data-testid="eye-look-button"
                  onClick={onEyeLook}
                >
                  <Icon className="eye-icon" fontAwesome="fa-eye" />
                </Tooltip>,
              ]}
              id="password"
              label="Password"
              type="password"
              {...register("password")}
            />

            <Input
              errorMessage={errors.confirmPassword}
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              {...register("confirmPassword")}
            />
          </div>
        )}
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
