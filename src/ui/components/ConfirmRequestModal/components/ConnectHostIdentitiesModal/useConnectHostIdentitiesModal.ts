import { IdentityData, PendingRequest, RequestResolutionAction, RequestResolutionStatus } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentityRequest, fetchHostIdentities, useHostIdentities } from "@src/ui/ducks/identities";
import { finalizeRequest } from "@src/ui/ducks/requests";
import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";

export interface IUseConnectHostIdentitiesModalArgs {
    pendingRequest: PendingRequest<{ host: string }>;
  }
  
export interface IUseConnectHostIdentitiesModalData {
    availableHostIdentities: IdentityData[],
    host?: string,
    faviconUrl: string,
    onCreateIdentityRequest: () => void
}

export const useConnectHostIdentitiesModal = ({ pendingRequest }: IUseConnectHostIdentitiesModalArgs): IUseConnectHostIdentitiesModalData => {
    const [faviconUrl, setFaviconUrl] = useState("");
    const dispatch = useAppDispatch();
    const availableHostIdentities = useHostIdentities();
  const { payload } = pendingRequest;
  const host = payload?.host ?? undefined;

  // Technically both "Create new Identity" and "Connect" are Accept actions. 
  // The only rejest action is the user clicks on the (x) button of the window.
  const onCreateIdentityRequest = useCallback(
    () => {
      const req: RequestResolutionAction = {
        id: pendingRequest?.id,
        status: RequestResolutionStatus.ACCEPT,
      };

      dispatch(finalizeRequest(req));
    },
    [pendingRequest?.id, dispatch],
  );

  useEffect(() => {
    if (!host) {
        return;
    }

    getLinkPreview(host).then((data) => {
        const [favicon] = data.favicons;
        setFaviconUrl(favicon);
      });

    dispatch(fetchHostIdentities(host));
  }, [dispatch]);

  return {
    availableHostIdentities,
    host,
    faviconUrl,
    onCreateIdentityRequest
  };
};
