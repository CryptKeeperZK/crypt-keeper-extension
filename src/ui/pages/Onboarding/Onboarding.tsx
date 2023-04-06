import { InputAdornment } from "@mui/material";
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

  return (
    <form className="flex flex-col flex-nowrap h-full onboarding" data-testid="onboarding-form" onSubmit={onSubmit}>
      <div className="flex flex-col items-center flex-grow p-8 onboarding__content">
        <Icon size={8} url={logoSVG} />

        <div className="text-lg pt-8">
          <b>Thanks for using CryptKeeper!</b>
        </div>

        <div className="text-base">To continue, please setup a password</div>

        
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
