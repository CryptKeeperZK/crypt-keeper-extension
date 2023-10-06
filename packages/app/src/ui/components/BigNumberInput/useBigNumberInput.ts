import { useCallback, useState, type FocusEvent as ReactFocusEvent, useEffect } from "react";

type FocusEventType = ReactFocusEvent<HTMLInputElement | HTMLTextAreaElement>;

export interface IUseBigNumberInputArgs {
  onBlurHandler?: (event: FocusEventType) => void;
  onFocusHandler?: (event: FocusEventType) => void;
}

export interface IUseBigNumberInputData {
  isFocused: boolean;
  isInitialized: boolean;
  isHex: boolean;
  onBlur: (event: FocusEventType) => void;
  onFocus: (event: FocusEventType) => void;
  onToggleHex: () => void;
}

export const useBigNumberInput = ({
  onBlurHandler,
  onFocusHandler,
}: IUseBigNumberInputArgs): IUseBigNumberInputData => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHex, setIsHex] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const onFocus = useCallback(
    (event: FocusEventType) => {
      setIsFocused(true);
      onFocusHandler?.(event);
    },
    [setIsFocused, onFocusHandler],
  );

  const onBlur = useCallback(
    (event: FocusEventType) => {
      setIsFocused(false);
      onBlurHandler?.(event);
    },
    [setIsFocused, onBlurHandler],
  );

  const onToggleHex = useCallback(() => {
    setIsHex((value) => !value);
  }, [setIsHex]);

  useEffect(() => {
    setIsInitialized(true);
  }, [setIsInitialized]);

  return {
    isFocused,
    isInitialized,
    isHex,
    onBlur,
    onFocus,
    onToggleHex,
  };
};
