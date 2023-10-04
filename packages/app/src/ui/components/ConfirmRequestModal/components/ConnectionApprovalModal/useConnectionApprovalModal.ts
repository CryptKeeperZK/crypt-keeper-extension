import { IHostPermission, IPendingRequest } from "@cryptkeeperzk/types";
import { getLinkPreview } from "link-preview-js";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHostPermissions, setHostPermissions, useHostPermission } from "@src/ui/ducks/permissions";

export interface IUseConnectionApprovalModalArgs {
  pendingRequest: IPendingRequest<{ urlOrigin: string }>;
  accept: (data?: unknown) => void;
  reject: (err?: Error) => void;
}

export interface IUseConnectionApprovalModalData {
  urlOrigin: string;
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
  const { payload } = pendingRequest;
  const urlOrigin = payload?.urlOrigin ?? "";
  const [canSkipApproveChecked, setCanSkipApproveChecked] = useState(false);

  const dispatch = useAppDispatch();
  const permission = useHostPermission(urlOrigin);

  const onAccept = useCallback(() => {
    const hostPermission: IHostPermission = {
      urlOrigin,
      canSkipApprove: canSkipApproveChecked,
    };
    accept(hostPermission);
  }, [accept, setCanSkipApproveChecked, canSkipApproveChecked]);

  const onReject = useCallback(() => {
    reject();
  }, [reject, setCanSkipApproveChecked]);

  const onSetApproval = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCanSkipApproveChecked(event.target.checked);
      dispatch(setHostPermissions({ urlOrigin, canSkipApprove: event.target.checked }));
    },
    [urlOrigin, dispatch, setCanSkipApproveChecked],
  );

  useEffect(() => {
    if (!urlOrigin) {
      return;
    }

    getLinkPreview(urlOrigin).then((data) => {
      const [favicon] = data.favicons;
      setFaviconUrl(favicon);
    });

    dispatch(fetchHostPermissions(urlOrigin));
  }, [urlOrigin, setFaviconUrl]);

  return {
    urlOrigin,
    // TODO: there is a possible bug here:
    // It kept true even if revoking the connection (Will be checked in later PR)
    checked: Boolean(permission?.canSkipApprove),
    faviconUrl,
    onAccept,
    onReject,
    onSetApproval,
  };
};
