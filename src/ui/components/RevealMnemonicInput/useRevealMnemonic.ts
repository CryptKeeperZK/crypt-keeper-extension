import { useCallback, useState } from "react";

import { useTimeout } from "@src/ui/hooks/timeout";
import { copyToClipboard, downloadFile } from "@src/util/browser";

export interface IUseRevealMnemonicArgs {
  mnemonic: string;
}

export interface IUseRevealMnemonicData {
  isShowMnemonic: boolean;
  isCopied: boolean;
  isDownloaded: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onShowMnemonic: () => void;
}

const OPERATION_TIMEOUT_MS = 1_000;

export const useRevealMnemonic = ({ mnemonic }: IUseRevealMnemonicArgs): IUseRevealMnemonicData => {
  const [isShowMnemonic, setShowMnemonic] = useState(false);

  const { isActive: isCopied, setActive: setCopied } = useTimeout(OPERATION_TIMEOUT_MS);
  const { isActive: isDownloaded, setActive: setDownloaded } = useTimeout(OPERATION_TIMEOUT_MS);

  const onShowMnemonic = useCallback(() => {
    setShowMnemonic((show) => !show);
  }, [setShowMnemonic]);

  const onCopy = useCallback(() => {
    setCopied(true);
    copyToClipboard(mnemonic);
  }, [mnemonic, setCopied]);

  const onDownload = useCallback(() => {
    setDownloaded(true);
    downloadFile(`data:text/txt;charset=utf-8,${encodeURIComponent(mnemonic)}`, "ck-mnemonic.txt");
  }, [mnemonic, setDownloaded]);

  return {
    isShowMnemonic,
    isCopied,
    isDownloaded,
    onShowMnemonic,
    onCopy,
    onDownload,
  };
};
