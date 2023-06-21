/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { object, string } from "yup";

import { useValidationResolver } from "..";

describe("ui/hooks/validation", () => {
  const schema = object().shape({
    password: string().required("Password is required").min(8, "Min password length is 8 symbols"),
  });

  test("should return validated values properly", async () => {
    const { result } = renderHook(() => useValidationResolver(schema));

    const args = { password: "12345678" };
    const { values, errors } = await result.current(args);

    expect(values).toStrictEqual(args);
    expect(errors).toStrictEqual({});
  });

  test("should handle validation errors properly", async () => {
    const { result } = renderHook(() => useValidationResolver(schema));

    const args = { password: "" };
    const { values, errors } = await result.current(args);

    expect(values).toStrictEqual(args);
    expect(errors).toStrictEqual({
      password: {
        type: "min",
        message: "Min password length is 8 symbols",
      },
    });
  });
});
