/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { useParams, useSearchParams } from "react-router-dom";

import { useSearchParam, useUrlParam } from "..";

jest.mock("react-router-dom", (): unknown => ({
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("ui/hooks/url", () => {
  const defaultUrlParams = {
    param: "value",
  };

  const defaultSearchParams = new URLSearchParams([["param", "value"]]);

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue(defaultUrlParams);

    (useSearchParams as jest.Mock).mockReturnValue([defaultSearchParams]);
  });

  test("should return param from url", () => {
    const { result } = renderHook(() => useUrlParam("param"));

    expect(result.current).toBe(defaultUrlParams.param);
  });

  test("should return undefined if there is no such url param", () => {
    const { result } = renderHook(() => useUrlParam("unknown"));

    expect(result.current).toBeUndefined();
  });

  test("should return param from search", () => {
    const { result } = renderHook(() => useSearchParam("param"));

    expect(result.current).toBe(defaultUrlParams.param);
  });

  test("should return undefined if there is no such search param", () => {
    const { result } = renderHook(() => useSearchParam("unknown"));

    expect(result.current).toBeUndefined();
  });
});
