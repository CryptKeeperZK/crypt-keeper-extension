import { KeyboardEvent as ReactKeyboardEvent, useCallback, useState } from "react";

import { RPCAction } from "@src/constants";
import LogoSVG from "@src/static/icons/logo.svg";
import Button, { ButtonType } from "@src/ui/components/Button";
import Icon from "@src/ui/components/Icon";
import Input from "@src/ui/components/Input";
import postMessage from "@src/util/postMessage";

import "./onboarding.scss";

const Onboarding = (): JSX.Element => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isValid = !!password && password === confirmPassword;

  const onCreatePassword = useCallback(() => {
    if (!isValid) {
      setError("Invalid password");
      return;
    }

    postMessage({
      method: RPCAction.SETUP_PASSWORD,
      payload: password,
    }).catch((err: Error) => {
      setError(err.message);
    });
  }, [isValid, password, confirmPassword, setError]);

  const handleKeypress = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter") {
      onCreatePassword();
    }
  };

  return (
    <div className="flex flex-col flex-nowrap h-full onboarding">
      <div className="flex flex-col items-center flex-grow p-8 onboarding__content">
        <Icon url={LogoSVG} />

        <div className="text-lg pt-8">
          <b>Thanks for using CryptKeeper!</b>
        </div>

        <div className="text-base">To continue, please setup a password</div>

        <div className="py-8 w-full">
          <Input
            autoFocus
            className="mb-4"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeypress}
          />
        </div>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex flex-row items-center justify-center flex-shrink p-8 onboarding__footer">
        <Button
          btnType={ButtonType.primary}
          disabled={!password || password !== confirmPassword}
          type="submit"
          onClick={onCreatePassword}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
