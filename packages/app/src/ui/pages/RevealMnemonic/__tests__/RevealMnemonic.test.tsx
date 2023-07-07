/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";

import Mnemonic from "..";
import { IUseRevealMnemonicData, useRevealMnemonic } from "../useRevealMnemonic";

jest.mock("../useRevealMnemonic", (): unknown => ({
  useRevealMnemonic: jest.fn(),
}));

describe("ui/pages/RevealMnemonic", () => {
  const defaultHookData: IUseRevealMnemonicData = {
    error: "",
    mnemonic: "mnemonic",
    onGoBack: jest.fn(),
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

  test("should render error properly", async () => {
    (useRevealMnemonic as jest.Mock).mockReturnValue({ ...defaultHookData, mnemonic: undefined, error: "error" });

    const { container, findByText } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const error = await findByText("error");

    expect(error).toBeInTheDocument();
  });

  test("should go back properly", async () => {
    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const icon = await findByTestId("close-icon");
    await act(() => Promise.resolve(icon.click()));

    expect(defaultHookData.onGoBack).toBeCalledTimes(1);
  });
});
