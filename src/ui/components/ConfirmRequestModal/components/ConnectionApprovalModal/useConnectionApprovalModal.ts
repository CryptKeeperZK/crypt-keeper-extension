import { getLinkPreview } from "link-preview-js";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { PendingRequest } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHostPermissions, setHostPermissions, useHostPermission } from "@src/ui/ducks/permissions";

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
  const [faviconUrl, setFaviconUrl] = useState("");
  const [canSkipApprove, setCanSkipApprove] = useState(false);
  const { payload } = pendingRequest;
  const host = payload?.origin ?? "";

  const dispatch = useAppDispatch();
  const permission = useHostPermission(host);

  const onAccept = useCallback(() => {
    if (canSkipApprove) {
      console.log("INside canSkipApprove");
      dispatch(setHostPermissions({ host, canSkipApprove }));
    }
    accept();
  }, [accept]);

  const onReject = useCallback(() => {
    reject();
  }, [reject]);

  const onSetApproval = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCanSkipApprove(event.target.checked);
    },
    [setCanSkipApprove],
  );

  useEffect(() => {
    if (!host) {
      return;
    }

    getLinkPreview(host).then((data) => {
      const [favicon] = data.favicons;
      setFaviconUrl(favicon);
    });

    dispatch(fetchHostPermissions(host));
  }, [host, setFaviconUrl]);

  return {
    host,
    checked: Boolean(permission?.canSkipApprove),
    faviconUrl,
    onAccept,
    onReject,
    onSetApproval,
  };
};
