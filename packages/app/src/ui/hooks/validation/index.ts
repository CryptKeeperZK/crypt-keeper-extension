import { useCallback } from "react";
import { object, string, type Schema, type ValidationError } from "yup";

import { validateMnemonic } from "@src/background/services/mnemonic";

export type ValidationResolver<T> = (data: T) => Promise<{ values: T; errors: Errors }>;
type Errors = Record<string, { type: string; message: string }>;

export const passwordRules =
  /^(?=.*[0-9])(?=.*[~`!@#$%^&*()-_+={}[\]|/:;"'<>,.?])[a-zA-Z0-9!~`!@#$%^&*()-_+={}[\]|/:;"'<>,.?]{8,}$/;

export const mnemonicValidationSchema = object({
  mnemonic: string()
    .test("mnemonic", "Mnemonic is invalid", (mnemonic?: string) => (mnemonic ? validateMnemonic(mnemonic) : false))
    .required("Mnemonic is required"),
});

export const useValidationResolver = <T>(validationSchema: Schema<T>): ValidationResolver<T> =>
  useCallback(
    async (data: T) =>
      validationSchema
        .validate(data, {
          abortEarly: false,
          stripUnknown: true,
          recursive: true,
        })
        .then((res) => ({ values: res, errors: {} }))
        .catch((error: ValidationError) => {
          const errors = error.inner.reduce(
            (allErrors: Errors, currentError: ValidationError) => ({
              ...allErrors,
              [currentError.path!]: {
                type: currentError.type!,
                message: currentError.message,
              },
            }),
            {},
          );

          return { values: data, errors };
        }),
    [validationSchema],
  );
