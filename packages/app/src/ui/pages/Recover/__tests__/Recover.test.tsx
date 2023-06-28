/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { useNavigate } from "react-router-dom";

import { defaultMnemonic } from "@src/config/mock/wallet";

import Recover from "..";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

describe("ui/pages/Recover", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
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

  test("should render root error properly", async () => {
    const { container, findByTestId, findByText, findByPlaceholderText } = render(
      <Suspense>
        <Recover />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const mnemonicInput = await findByPlaceholderText("Enter mnemonic");
    await act(async () => Promise.resolve(fireEvent.change(mnemonicInput, { target: { value: defaultMnemonic } })));

    const button = await findByTestId("submit-button");
    await act(() => Promise.resolve(button.click()));

    const error = await findByText("implement");

    expect(error).toBeInTheDocument();
  });
});
