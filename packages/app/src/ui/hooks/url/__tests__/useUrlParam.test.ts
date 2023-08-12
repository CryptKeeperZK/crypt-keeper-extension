/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { useParams } from "react-router-dom";

import { useUrlParam } from "..";

jest.mock("react-router-dom", (): unknown => ({
  useParams: jest.fn(),
}));

describe("ui/hooks/url", () => {
  const defaultUrlParams = {
    param: "value",
  };

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue(defaultUrlParams);
  });

  test("should return param from url", () => {
    const { result } = renderHook(() => useUrlParam("param"));

    expect(result.current).toBe(defaultUrlParams.param);
  });

  test("should return undefined if there is no such param", () => {
    const { result } = renderHook(() => useUrlParam("unknown"));

    expect(result.current).toBeUndefined();
  });
});
