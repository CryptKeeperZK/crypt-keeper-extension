import { KeyboardEvent as ReactKeyboardEvent, useCallback, useState } from "react";

import { RPCAction } from "@src/constants";
import LogoSVG from "@src/static/icons/logo.svg";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import postMessage from "@src/util/postMessage";

import "./login.scss";

const Login = (): JSX.Element => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = !!password;

  const onLogin = useCallback(() => {
    if (!isValid) {
      setError("Invalid password");
      return;
    }

    setLoading(true);

    postMessage({
      method: RPCAction.UNLOCK,
      payload: password,
    })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isValid, password, setError, setLoading]);

  const handleKeypress = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter") {
      onLogin();
    }
  };

  return (
    <div className="flex flex-col flex-nowrap h-full login">
      <div className="flex flex-col items-center flex-grow p-8 login__content">
        <Icon url={LogoSVG} />

        <div className="text-lg pt-8">
          <b>Welcome Back!</b>
        </div>

        <div className="text-base">To continue, please unlock your wallet</div>

        <div className="py-8 w-full">
          <Input
            autoFocus
            className="mb-4"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeypress}
          />
        </div>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex flex-row items-center justify-center flex-shrink p-8 login__footer">
        <Button buttonType={ButtonType.PRIMARY} disabled={!password} loading={loading} onClick={onLogin}>
          Unlock
        </Button>
      </div>
    </div>
  );
};

export default Login;
