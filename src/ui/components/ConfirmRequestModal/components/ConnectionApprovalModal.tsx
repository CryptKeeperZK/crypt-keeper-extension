import { PendingRequest } from "@src/types";
import { fetchApproval, setHostPermission, useAppDispatch, useApproves } from "@src/ui/ducks";
import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";
import Button, { ButtonType } from "../../Button";
import Checkbox from "../../Checkbox";
import FullModal, { FullModalContent, FullModalFooter, FullModalHeader } from "../../FullModal";

export function ConnectionApprovalModal(props: {
  len: number;
  reject: () => void;
  accept: () => void;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
}) {
  const { payload } = props.pendingRequest;
  const host = (payload as { origin: string } | undefined)?.origin;
  const dispatch = useAppDispatch();
  const [faviconUrl, setFaviconUrl] = useState("");
  const { noApproval } = useApproves();
  useEffect(() => {
    (async () => {
      if (host) {
        dispatch(fetchApproval(host));
      }
    })();
  }, [host]);

  useEffect(() => {
    (async () => {
      if (host) {
        const data = await getLinkPreview(host).catch(() => undefined);
        const [favicon] = data?.favicons || [];
        setFaviconUrl(favicon);
      }
    })();
  }, [host]);

  const setApproval = useCallback(
    async (noApproval: boolean) => {
      dispatch(
        setHostPermission({
          host: host,
          noApproval,
        }),
      );
    },
    [host],
  );

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Connect with CryptKeeper
        {props.len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${props.len}`}</div>}
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
        <div className="text-lg font-semibold mb-2 text-center">
          {`${host} would like to connect to your identity`}
        </div>
        <div className="text-sm text-gray-500 text-center">
          This site is requesting access to view your current identity. Always make sure you trust the site you interact
          with.
        </div>
        <div className="font-bold mt-4">Permissions</div>
        <div className="flex flex-row items-start">
          <Checkbox
            className="mr-2 mt-2 flex-shrink-0"
            checked={noApproval}
            onChange={(e) => {
              setApproval(e.target.checked);
            }}
          />
          <div className="text-sm mt-2">Allow host to create proof without approvals</div>
        </div>
      </FullModalContent>
      {props.error && <div className="text-xs text-red-500 text-center pb-1">{props.error}</div>}
      <FullModalFooter>
        <Button btnType={ButtonType.secondary} onClick={props.reject} loading={props.loading}>
          Reject
        </Button>
        <Button className="ml-2" onClick={props.accept} loading={props.loading}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
