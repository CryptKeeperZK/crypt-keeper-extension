/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";

import Mnemonic from "..";
import { IUseGenerateMnemonicData, useGenerateMnemonic } from "../useGenerateMnemonic";

jest.mock("../useGenerateMnemonic", (): unknown => ({
  useGenerateMnemonic: jest.fn(),
}));

describe("ui/pages/GenerateMnemonic", () => {
  const defaultHookData: IUseGenerateMnemonicData = {
    isLoading: false,
    error: "",
    mnemonic: "mnemonic",
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

  test("should render error properly", async () => {
    (useGenerateMnemonic as jest.Mock).mockReturnValue({ ...defaultHookData, mnemonic: undefined, error: "error" });

    const { container, findByText } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const error = await findByText("error");

    expect(error).toBeInTheDocument();
  });

  test("should go home properly", async () => {
    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("submit-button");
    await act(() => Promise.resolve(button.click()));

    expect(defaultHookData.onSaveMnemonic).toBeCalledTimes(1);
  });
});
