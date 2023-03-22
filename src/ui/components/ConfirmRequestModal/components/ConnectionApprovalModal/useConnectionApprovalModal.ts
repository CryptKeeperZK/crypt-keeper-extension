import { getLinkPreview } from "link-preview-js";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { RPCAction } from "@src/constants";
import { PendingRequest } from "@src/types";
import postMessage from "@src/util/postMessage";

export interface IUseConnectionApprovalModalArgs {
  pendingRequest: PendingRequest<{ origin: string }>;
  accept: () => void;
  reject: () => void;
}

export interface IUseConnectionApprovalModalData {
  host: string;
  checked: boolean;
  faviconUrl: string;
  onAccept: () => void;
  onReject: () => void;
  onSetApproval: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const useConnectionApprovalModal = ({
  pendingRequest,
  accept,
  reject,
}: IUseConnectionApprovalModalArgs): IUseConnectionApprovalModalData => {
  const [checked, setChecked] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState("");
  const { payload } = pendingRequest;
  const host = payload?.origin ?? "";

  const onAccept = useCallback(() => {
    accept();
  }, [accept]);

  const onReject = useCallback(() => {
    reject();
  }, [reject]);

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
  }, [host, setChecked, setFaviconUrl]);

  return {
    host,
    checked,
    faviconUrl,
    onAccept,
    onReject,
    onSetApproval,
  };
};
