import { useEffect, useState } from "react";

export interface IUseTimeoutData {
  isActive: boolean;
  setActive: (isActive: boolean) => void;
}

const DEFAULT_TIMEOUT_MS = 2_000;

export const useTimeout = (timeout = DEFAULT_TIMEOUT_MS): IUseTimeoutData => {
  const [isActive, setActive] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setActive(false);
    }, timeout);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isActive, setActive]);

  return {
    isActive,
    setActive,
  };
};
