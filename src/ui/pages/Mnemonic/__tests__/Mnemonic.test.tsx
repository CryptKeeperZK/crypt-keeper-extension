/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";

import Mnemonic from "..";
import { IUseMnemonicData, useMnemonic } from "../useMnemonic";

jest.mock("../useMnemonic", (): unknown => ({
  useMnemonic: jest.fn(),
}));

describe("ui/pages/Mnemonic", () => {
  const defaultHookData: IUseMnemonicData = {
    mnemonic: "mnemonic",
    onGoHome: jest.fn(),
  };

  beforeEach(() => {
    (useMnemonic as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("mnemonic-page");

    expect(page).toBeInTheDocument();
  });

  test("should go home properly", async () => {
    const { container, findByTestId } = render(<Mnemonic />);
    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("submit-button");
    await act(() => Promise.resolve(button.click()));

    expect(defaultHookData.onGoHome).toBeCalledTimes(1);
  });
});
