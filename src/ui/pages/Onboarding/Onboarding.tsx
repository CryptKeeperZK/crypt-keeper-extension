import { ButtonType, Button } from "@src/ui/components/Button";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";

import logoSVG from "../../../static/icons/logo.svg";

import "./onboarding.scss";
import { useOnboarding } from "./useOnboarding";

export const Onboarding = (): JSX.Element => {
  const { isValid, password, confirmPassword, error, isLoading, onChangePassword, onChangeConfirmPassword, onSubmit } =
    useOnboarding();

  return (
    <form className="flex flex-col flex-nowrap h-full onboarding" data-testid="onboarding-form" onSubmit={onSubmit}>
      <div className="flex flex-col items-center flex-grow p-8 onboarding__content">
        <Icon url={logoSVG} />

        <div className="text-lg pt-8">
          <b>Thanks for using CryptKeeper!</b>
        </div>

        <div className="text-base">To continue, please setup a password</div>

        <div className="py-8 w-full">
          <Input
            autoFocus
            className="mb-4"
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={onChangePassword}
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={onChangeConfirmPassword}
          />
        </div>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex flex-row items-center justify-center flex-shrink p-8 onboarding__footer">
        <Button
          buttonType={ButtonType.PRIMARY}
          data-testid="submit-button"
          disabled={!isValid || isLoading}
          loading={isLoading}
          type="submit"
        >
          Continue
        </Button>
      </div>
    </form>
  );
};
