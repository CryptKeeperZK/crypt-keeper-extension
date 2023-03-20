import { getLinkPreview } from "link-preview-js";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { browser } from "webextension-polyfill-ts";

import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

export interface IUseConnectionModalArgs {
  refreshConnectionStatus: () => Promise<void>;
  onClose: () => void;
}

export interface IUseConnectionModalData {
  checked: boolean;
  faviconUrl: string;
  url?: URL;
  onRemoveHost: () => void;
  onSetApproval: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const useConnectionModal = ({
  refreshConnectionStatus,
  onClose,
}: IUseConnectionModalArgs): IUseConnectionModalData => {
  const [checked, setChecked] = useState(false);
  const [url, setUrl] = useState<URL>();
  const [faviconUrl, setFaviconUrl] = useState("");
  const host = url?.origin;

  useEffect(() => {
    browser.tabs.query({ active: true, lastFocusedWindow: true }).then(([tab]) => {
      if (tab?.url) {
        setUrl(new URL(tab.url));
      }
    });
  }, [setUrl]);

  useEffect(() => {
    if (!host) {
      return;
    }

    getLinkPreview(host).then((data) => {
      const [favicon] = data.favicons;
      setFaviconUrl(favicon);
    });

    postMessage<{ noApproval: boolean }>({
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: host,
    }).then((res) => setChecked(res.noApproval));
  }, [host, setFaviconUrl, setChecked]);

  const onRemoveHost = useCallback(() => {
    postMessage({
      method: RPCAction.REMOVE_HOST,
      payload: {
        host,
      },
    })
      .then(() => refreshConnectionStatus())
      .then(() => onClose());
  }, [host, refreshConnectionStatus, onClose]);

  const onSetApproval = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      postMessage<{ noApproval: boolean }>({
        method: RPCAction.SET_HOST_PERMISSIONS,
        payload: {
          host,
          noApproval: event.target.checked,
        },
      }).then((res) => setChecked(res.noApproval));
    },
    [host, setChecked],
  );

  return {
    checked,
    faviconUrl,
    url,
    onRemoveHost,
    onSetApproval,
  };
};
