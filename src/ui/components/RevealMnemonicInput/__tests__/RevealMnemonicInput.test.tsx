/**
 * @jest-environment jsdom
 */

import { act, render } from "@testing-library/react";

import { IRevealMnemonicInputProps, RevealMnemonicInput } from "..";
import { IUseRevealMnemonicData, useRevealMnemonic } from "../useRevealMnemonic";

jest.mock("../useRevealMnemonic", (): unknown => ({
  useRevealMnemonic: jest.fn(),
}));

describe("ui/components/RevealMnemonicInput", () => {
  const defaultHookData: IUseRevealMnemonicData = {
    isCopied: false,
    isDownloaded: false,
    isShowMnemonic: false,
    onCopy: jest.fn(),
    onDownload: jest.fn(),
    onShowMnemonic: jest.fn(),
  };

  const defaultArgs: IRevealMnemonicInputProps = {
    mnemonic: "mnemonic",
  };

  beforeEach(() => {
    (useRevealMnemonic as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { findByText } = render(<RevealMnemonicInput {...defaultArgs} />);

    const copyButton = await findByText("Copy to clipboard");
    const downloadButton = await findByText("Download");
    const showButton = await findByText("Show");

    expect(copyButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
    expect(showButton).toBeInTheDocument();
  });

  test("should show mnemonic properly", async () => {
    const { findByText } = render(<RevealMnemonicInput {...defaultArgs} />);

    const showButton = await findByText("Show");
    await act(() => Promise.resolve(showButton.click()));

    expect(defaultHookData.onShowMnemonic).toBeCalledTimes(1);
  });

  test("should hide mnemonic properly", async () => {
    (useRevealMnemonic as jest.Mock).mockReturnValue({ ...defaultHookData, isShowMnemonic: true });

    const { findByText } = render(<RevealMnemonicInput {...defaultArgs} />);

    const hideButton = await findByText("Hide");
    await act(() => Promise.resolve(hideButton.click()));

    expect(defaultHookData.onShowMnemonic).toBeCalledTimes(1);
  });

  test("should call copy and download properly", async () => {
    const { findByText } = render(<RevealMnemonicInput {...defaultArgs} />);

    const copyButton = await findByText("Copy to clipboard");
    const downloadButton = await findByText("Download");

    await act(() => Promise.resolve(copyButton.click()));
    await act(() => Promise.resolve(downloadButton.click()));

    expect(defaultHookData.onCopy).toBeCalledTimes(1);
    expect(defaultHookData.onDownload).toBeCalledTimes(1);
  });
});
