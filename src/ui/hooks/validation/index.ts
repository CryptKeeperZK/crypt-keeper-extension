import { useCallback } from "react";

import type { Schema, ValidationError } from "yup";

export type ValidationResolver<T> = (data: T) => Promise<{ values: T; errors: Errors }>;
type Errors = Record<string, { type: string; message: string }>;

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
              [currentError.path as string]: {
                type: currentError.type as string,
                message: currentError.message,
              },
            }),
            {},
          );

          return { values: data, errors };
        }),
    [validationSchema],
  );
