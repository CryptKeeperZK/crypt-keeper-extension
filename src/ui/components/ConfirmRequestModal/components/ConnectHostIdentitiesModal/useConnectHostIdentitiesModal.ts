import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";

import { IdentityData, PendingRequest, RequestResolutionAction, RequestResolutionStatus, SelectedIdentity } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  fetchHostIdentities,
  fetchRandomIdentities,
  setConnectedIdentity,
  setSelectedToConnect,
  useHostIdentities,
  useNotReadyToConnect,
  useRandomIdentities,
  useSelectedToConnect,
} from "@src/ui/ducks/identities";
import { finalizeRequest } from "@src/ui/ducks/requests";

export interface IUseConnectHostIdentitiesModalArgs {
  pendingRequest: PendingRequest<{ host: string }>;
  accept: (data?: unknown) => void;
  reject: () => void;
}

export interface IUseConnectHostIdentitiesModalData {
  hostIdentities: IdentityData[];
  randomIdentities: IdentityData[];
  host?: string;
  notReadyToConnect: boolean;
  faviconUrl: string;
  selectedToConnect: SelectedIdentity;
  onCreateIdentityRequest: () => void;
  onConenctIdentity: (identityCommitment: string, host: string) => void;
  handleConnectIdentity: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export const useConnectHostIdentitiesModal = ({
  pendingRequest,
  accept,
  reject,
}: IUseConnectHostIdentitiesModalArgs): IUseConnectHostIdentitiesModalData => {
  const [faviconUrl, setFaviconUrl] = useState("");
  const [selectedToConnects, setSelectedToConnect ] = useState<SelectedIdentity>({
    commitment: "",
    host: ""
  })
  const dispatch = useAppDispatch();
  const hostIdentities = useHostIdentities();
  const randomIdentities = useRandomIdentities();
  const notReadyToConnect = useNotReadyToConnect();
  const selectedToConnect = useSelectedToConnect();
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

  const onConenctIdentity = useCallback(
    async (identityCommitment: string, host: string) => {
      if (!accept) {
        throw new Error("Please set accept to be able to continue");
      }
      await dispatch(setConnectedIdentity(identityCommitment, host));
      accept();
    },
    [accept, dispatch],
  );

  const handleConnectIdentity = useCallback(async() => {
    if (selectedToConnect.host && selectedToConnect.host !== "" && selectedToConnect.commitment !== "") {
      await onConenctIdentity(selectedToConnect.commitment, selectedToConnect.host); 
    }
    throw new Error("Please set host in order to continue this action.");
  }, [onConenctIdentity, selectedToConnect, dispatch]);


  const onAccept = useCallback(() => {
    accept();
  }, [accept]);

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
  }, [dispatch, notReadyToConnect, setSelectedToConnect]);

  return {
    hostIdentities,
    randomIdentities,
    host,
    notReadyToConnect,
    faviconUrl,
    selectedToConnect,
    onCreateIdentityRequest,
    onConenctIdentity,
    handleConnectIdentity,
    onAccept,
    onReject,
  };
};
