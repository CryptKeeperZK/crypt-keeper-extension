/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, waitFor } from "@testing-library/react";

import Mnemonic from "..";
import { IUseRevealMnemonicData, useRevealMnemonic } from "../useRevealMnemonic";

jest.mock("../useRevealMnemonic", (): unknown => ({
  useRevealMnemonic: jest.fn(),
}));

describe("ui/pages/RevealMnemonic", () => {
  const defaultHookData: IUseRevealMnemonicData = {
    isLoading: false,
    isShowPassword: false,
    errors: {},
    mnemonic: "mnemonic",
    register: jest.fn(),
    onGoBack: jest.fn(),
    onShowPassword: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    (useRevealMnemonic as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("reveal-mnemonic-page");

    expect(page).toBeInTheDocument();
  });

  test("should render password form properly", async () => {
    (useRevealMnemonic as jest.Mock).mockReturnValue({
      ...defaultHookData,
      mnemonic: undefined,
    });

    const { container, findByTestId, findByLabelText } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const input = await findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(input, { target: { value: "password" } })));

    const button = await findByTestId("unlock-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(defaultHookData.onSubmit).toHaveBeenCalledTimes(1);
  });

  test("should render error properly", async () => {
    (useRevealMnemonic as jest.Mock).mockReturnValue({
      ...defaultHookData,
      mnemonic: undefined,
      errors: { password: "Password is required", root: "error" },
    });

    const { container, findByText } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const error = await findByText("error");
    const requiredError = await findByText("Password is required");

    expect(error).toBeInTheDocument();
    expect(requiredError).toBeInTheDocument();
  });

  test("should go back properly", async () => {
    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const icon = await findByTestId("close-icon");
    await act(() => Promise.resolve(icon.click()));

    expect(defaultHookData.onGoBack).toHaveBeenCalledTimes(1);
  });
});
