/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";

import { useAppDispatch, useAppSelector } from "../hooks";

jest.mock("react-redux", (): unknown => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

describe("ui/ducks/hooks", () => {
  beforeEach(() => {
    (useDispatch as jest.Mock).mockReturnValue(jest.fn());

    (useSelector as jest.Mock).mockReturnValue(1);
  });

  test("should return dispatch properly", () => {
    const { result } = renderHook(() => useAppDispatch());

    expect(result.current).toBeDefined();
  });

  test("should return slice properly", () => {
    const { result } = renderHook(() => useAppSelector(() => 1));

    expect(result.current).toBe(1);
  });
});
