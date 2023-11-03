/**
 * @jest-environment jsdom
 */

import { act, render } from "@testing-library/react";

import { IMnemonicInputProps, MnemonicInput } from "..";
import { IUseMnemonicInputData, useMnemonicInput } from "../useMnemonicInput";

jest.mock("../useMnemonicInput", (): unknown => ({
  useMnemonicInput: jest.fn(),
}));

describe("ui/components/MnemonicInput", () => {
  const defaultHookData: IUseMnemonicInputData = {
    isCopied: false,
    isDownloaded: false,
    isShowMnemonic: false,
    onCopy: jest.fn(),
    onDownload: jest.fn(),
    onShowMnemonic: jest.fn(),
  };

  const defaultArgs: IMnemonicInputProps = {
    hideOptions: false,
    value: "mnemonic",
  };

  beforeEach(() => {
    (useMnemonicInput as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { findByText } = render(<MnemonicInput {...defaultArgs} />);

    const copyButton = await findByText("Copy");
    const downloadButton = await findByText("Download");
    const showButton = await findByText("Show");

    expect(copyButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
    expect(showButton).toBeInTheDocument();
  });

  test("should show mnemonic properly", async () => {
    const { findByText } = render(<MnemonicInput {...defaultArgs} />);

    const showButton = await findByText("Show");
    await act(() => Promise.resolve(showButton.click()));

    expect(defaultHookData.onShowMnemonic).toHaveBeenCalledTimes(1);
  });

  test("should hide mnemonic properly", async () => {
    (useMnemonicInput as jest.Mock).mockReturnValue({ ...defaultHookData, isShowMnemonic: true });

    const { findByText } = render(<MnemonicInput {...defaultArgs} />);

    const hideButton = await findByText("Hide");
    await act(() => Promise.resolve(hideButton.click()));

    expect(defaultHookData.onShowMnemonic).toHaveBeenCalledTimes(1);
  });

  test("should render operation pending labels", async () => {
    (useMnemonicInput as jest.Mock).mockReturnValue({ ...defaultHookData, isCopied: true, isDownloaded: true });

    const { findByText } = render(<MnemonicInput {...defaultArgs} />);

    const copyButton = await findByText("Copied!");
    const downloadButton = await findByText("Downloaded!");

    expect(copyButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
  });

  test("should call copy and download properly", async () => {
    const { findByText } = render(<MnemonicInput {...defaultArgs} />);

    const copyButton = await findByText("Copy");
    const downloadButton = await findByText("Download");

    await act(() => Promise.resolve(copyButton.click()));
    await act(() => Promise.resolve(downloadButton.click()));

    expect(defaultHookData.onCopy).toHaveBeenCalledTimes(1);
    expect(defaultHookData.onDownload).toHaveBeenCalledTimes(1);
  });
});
