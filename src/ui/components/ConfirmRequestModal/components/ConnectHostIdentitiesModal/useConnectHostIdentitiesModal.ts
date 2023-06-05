import { IdentityData, PendingRequest, RequestResolutionAction, RequestResolutionStatus } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentityRequest, fetchHostIdentities, fetchRandomIdentities, useHostIdentities, useRandomIdentities } from "@src/ui/ducks/identities";
import { finalizeRequest } from "@src/ui/ducks/requests";
import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";

export interface IUseConnectHostIdentitiesModalArgs {
  pendingRequest: PendingRequest<{ host: string }>;
  reject: () => void
}

export interface IUseConnectHostIdentitiesModalData {
  hostIdentities: IdentityData[];
  randomIdentities: IdentityData[];
  host?: string;
  faviconUrl: string;
  onCreateIdentityRequest: () => void;
  onReject: () => void;
}

export const useConnectHostIdentitiesModal = ({
  pendingRequest,
  reject
}: IUseConnectHostIdentitiesModalArgs): IUseConnectHostIdentitiesModalData => {
  const [faviconUrl, setFaviconUrl] = useState("");
  const dispatch = useAppDispatch();
  const hostIdentities = useHostIdentities();
  const randomIdentities = useRandomIdentities();
  const { payload } = pendingRequest;
  const host = payload?.host ?? undefined;

  // Technically both "Create new Identity" and "Connect" are Accept actions.
  // The only rejest action is the user clicks on the (x) button of the window.
  const onCreateIdentityRequest = useCallback(() => {
    const req: RequestResolutionAction = {
      id: pendingRequest?.id,
      status: RequestResolutionStatus.ACCEPT,
    };

    dispatch(finalizeRequest(req));
  }, [pendingRequest?.id, dispatch]);

  const onReject = useCallback(() => {
    reject();
  }, [reject]);

  useEffect(() => {
    if (!host) {
      return;
    }

    getLinkPreview(host).then((data) => {
      const [favicon] = data.favicons;
      setFaviconUrl(favicon);
    });

    dispatch(fetchHostIdentities(host));
    dispatch(fetchRandomIdentities());
  }, [dispatch]);

  return {
    hostIdentities,
    randomIdentities,
    host,
    faviconUrl,
    onCreateIdentityRequest,
    onReject
  };
};
