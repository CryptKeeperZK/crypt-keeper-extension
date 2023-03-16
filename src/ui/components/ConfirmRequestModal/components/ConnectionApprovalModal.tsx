import { PendingRequest } from "@src/types";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "../../FullModal";

import { getLinkPreview } from "link-preview-js";

import { RPCAction } from "@src/constants";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Checkbox } from "@src/ui/components/Checkbox";
import postMessage from "@src/util/postMessage";

interface ConnectionModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
  accept: () => void;
  reject: () => void;
}

export default function ConnectionApprovalModal({
  len,
  pendingRequest,
  error,
  loading,
  accept,
  reject,
}: ConnectionModalProps) {
  const { payload } = pendingRequest;
  const host = (payload as { origin: string } | undefined)?.origin ?? "";
  const [checked, setChecked] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState("");

  const handleAccept = useCallback(() => {
    accept();
  }, [accept]);

  const handleReject = useCallback(() => {
    reject();
  }, [reject]);

  const handleSetApproval = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      postMessage<{ noApproval: boolean }>({
        method: RPCAction.SET_HOST_PERMISSIONS,
        payload: {
          host,
          noApproval: event.target.checked,
        },
      }).then((res) => setChecked(res?.noApproval));
    },
    [host, setChecked],
  );

  useEffect(() => {
    if (host) {
      postMessage<{ noApproval: boolean }>({
        method: RPCAction.GET_HOST_PERMISSIONS,
        payload: host,
      }).then((res) => setChecked(res?.noApproval));
    }
  }, [host, setChecked]);

  useEffect(() => {
    if (host) {
      getLinkPreview(host)
        .then((data) => {
          const [favicon] = data.favicons;
          setFaviconUrl(favicon);
        })
        .catch(() => undefined);
    }
  }, [host, setFaviconUrl]);

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Connect with CryptKeeper
        {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}
      </FullModalHeader>

      <FullModalContent className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0">
          <div
            className="w-16 h-16"
            style={{
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundImage: `url(${faviconUrl})`,
            }}
          />
        </div>

        <div className="text-lg font-semibold mb-2 text-center">{`${host} would like to connect to your identity`}</div>

        <div className="text-sm text-gray-500 text-center">
          This site is requesting access to view your current identity. Always make sure you trust the site you interact
          with.
        </div>

        <div className="font-bold mt-4">Permissions</div>

        <div className="flex flex-row items-start">
          <Checkbox checked={checked} className="mr-2 mt-2 flex-shrink-0" onChange={handleSetApproval} />

          <div className="text-sm mt-2">Allow host to create proof without approvals</div>
        </div>
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

      <FullModalFooter>
        <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={handleReject}>
          Reject
        </Button>

        <Button className="ml-2" loading={loading} onClick={handleAccept}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
