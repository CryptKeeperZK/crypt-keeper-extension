/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { useNavigate } from "react-router-dom";

import { defaultMnemonic } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { checkMnemonic } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import Recover from "..";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  checkMnemonic: jest.fn(),
}));

describe("ui/pages/Recover", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <Recover />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("recover-page");

    expect(page).toBeInTheDocument();
  });

  test("should render mnemonic error properly", async () => {
    const { container, findByTestId, findByText } = render(
      <Suspense>
        <Recover />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("submit-button");
    await act(() => Promise.resolve(button.click()));

    const error = await findByText("Mnemonic is required");

    expect(error).toBeInTheDocument();
  });

  test("should submit form properly", async () => {
    const { container, findByTestId, findByPlaceholderText } = render(
      <Suspense>
        <Recover />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const mnemonicInput = await findByPlaceholderText("Enter mnemonic");
    await act(async () => Promise.resolve(fireEvent.change(mnemonicInput, { target: { value: defaultMnemonic } })));

    const button = await findByTestId("submit-button");
    await act(() => Promise.resolve(button.click()));

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(checkMnemonic).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`${Paths.RESET_PASSWORD}?mnemonic=${defaultMnemonic}`);
  });
});
