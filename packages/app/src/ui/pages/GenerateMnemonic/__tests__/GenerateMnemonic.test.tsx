/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";

import { defaultMnemonic } from "@src/config/mock/wallet";

import Mnemonic from "..";
import { EGenerateMnemonicMode, IUseGenerateMnemonicData, useGenerateMnemonic } from "../useGenerateMnemonic";

jest.mock("../useGenerateMnemonic", (): unknown => ({
  ...jest.requireActual("../useGenerateMnemonic"),
  useGenerateMnemonic: jest.fn(),
}));

describe("ui/pages/GenerateMnemonic", () => {
  const defaultHookData: IUseGenerateMnemonicData = {
    isLoading: false,
    errors: {},
    mnemonic: defaultMnemonic,
    mode: EGenerateMnemonicMode.GENERATE,
    register: jest.fn(),
    onChooseGenerateMode: jest.fn(),
    onChooseInputMode: jest.fn(),
    onSaveMnemonic: jest.fn(),
  };

  beforeEach(() => {
    (useGenerateMnemonic as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("generate-mnemonic-page");

    expect(page).toBeInTheDocument();
  });

  test("should change to input mode properly", async () => {
    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("change-mode-button");
    await act(() => Promise.resolve(button.click()));

    expect(defaultHookData.onChooseInputMode).toBeCalledTimes(1);
  });

  test("should change to generate mode properly", async () => {
    (useGenerateMnemonic as jest.Mock).mockReturnValue({ ...defaultHookData, mode: EGenerateMnemonicMode.INPUT });

    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("change-mode-button");
    await act(() => Promise.resolve(button.click()));

    expect(defaultHookData.onChooseGenerateMode).toBeCalledTimes(1);
  });

  test("should render error properly", async () => {
    (useGenerateMnemonic as jest.Mock).mockReturnValue({
      ...defaultHookData,
      errors: { mnemonic: "error" },
    });

    const { container, findByText } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const error = await findByText("error");

    expect(error).toBeInTheDocument();
  });

  test("should submit form properly", async () => {
    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("submit-button");
    await act(() => Promise.resolve(button.click()));

    expect(defaultHookData.onSaveMnemonic).toBeCalledTimes(1);
  });
});
