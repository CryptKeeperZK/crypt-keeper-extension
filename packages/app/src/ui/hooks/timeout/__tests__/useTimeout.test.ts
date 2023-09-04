/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { useTimeout } from "..";

describe("ui/hooks/timeout", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useTimeout());

    await waitFor(() => result.current.isActive === false);

    expect(result.current.isActive).toBe(false);
  });

  test("should wait for timeout properly", async () => {
    const { result } = renderHook(() => useTimeout(0));

    expect(result.current.isActive).toBe(false);

    await act(() => Promise.resolve(result.current.setActive(true)));
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      jest.runOnlyPendingTimers();

      await waitFor(() => result.current.isActive === false);
    });
  });
});
