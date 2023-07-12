/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";

import { defaultMnemonic } from "@src/config/mock/wallet";

import { useValidationResolver, mnemonicValidationSchema } from "..";

describe("ui/hooks/validation", () => {
  test("should return validated values properly", async () => {
    const { result } = renderHook(() => useValidationResolver(mnemonicValidationSchema));

    const args = { mnemonic: defaultMnemonic };
    const { values, errors } = await result.current(args);

    expect(values).toStrictEqual(args);
    expect(errors).toStrictEqual({});
  });

  test("should handle validation errors properly", async () => {
    const { result } = renderHook(() => useValidationResolver(mnemonicValidationSchema));

    const args = { mnemonic: "" };
    const { values, errors } = await result.current(args);

    expect(values).toStrictEqual(args);
    expect(errors).toStrictEqual({
      mnemonic: {
        type: "required",
        message: "Mnemonic is required",
      },
    });
  });

  test("should handle mnemonic validation errors properly", async () => {
    const { result } = renderHook(() => useValidationResolver(mnemonicValidationSchema));

    const args = { mnemonic: "invalid" };
    const { values, errors } = await result.current(args);

    expect(values).toStrictEqual(args);
    expect(errors).toStrictEqual({
      mnemonic: {
        type: "mnemonic",
        message: "Mnemonic is invalid",
      },
    });
  });
});
