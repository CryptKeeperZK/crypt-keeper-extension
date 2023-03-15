import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";
import { browser } from "webextension-polyfill-ts";

import { RPCAction } from "@src/constants";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Checkbox } from "@src/ui/components/Checkbox";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";
import postMessage from "@src/util/postMessage";

export interface ConnectionModalProps {
  refreshConnectionStatus: () => Promise<void>;
  onClose: () => void;
}

export const ConnectionModal = ({ refreshConnectionStatus, onClose }: ConnectionModalProps): JSX.Element => {
  const [checked, setChecked] = useState(false);
  const [url, setUrl] = useState<URL>();
  const [faviconUrl, setFaviconUrl] = useState("");

  useEffect(() => {
    browser.tabs.query({ active: true, lastFocusedWindow: true }).then(([tab]) => {
      if (tab?.url) {
        setUrl(new URL(tab.url));
      }
    });
  }, [setUrl]);

  useEffect(() => {
    if (!url?.origin) {
      return;
    }

    postMessage<{ noApproval: boolean }>({
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: url.origin,
    }).then((res) => setChecked(res?.noApproval));
  }, [url?.origin, setChecked]);

  useEffect(() => {
    if (!url?.origin) {
      return;
    }

    getLinkPreview(url?.origin)
      .then((data) => {
        const [favicon] = data.favicons;
        setFaviconUrl(favicon);
      })
      .catch(() => undefined);
  }, [url?.origin, setFaviconUrl]);

  const onRemoveHost = useCallback(() => {
    postMessage({
      method: RPCAction.REMOVE_HOST,
      payload: {
        host: url?.origin,
      },
    })
      .then(() => refreshConnectionStatus())
      .then(() => onClose());
  }, [url?.origin, refreshConnectionStatus, onClose]);

  const setApproval = useCallback(
    async (noApproval: boolean) => {
      const res = await postMessage<{ noApproval: boolean }>({
        method: RPCAction.SET_HOST_PERMISSIONS,
        payload: {
          host: url?.origin,
          noApproval,
        },
      });
      setChecked(res?.noApproval);
    },
    [url?.origin, setChecked],
  );

  return (
    <FullModal data-testid="connection-modal" onClose={onClose}>
      <FullModalHeader onClose={onClose}>
        {url?.protocol === "chrome-extension:" ? "Chrome Extension Page" : url?.host}
      </FullModalHeader>

      <FullModalContent className="flex flex-col items-center">
        {url?.protocol === "chrome-extension:" ? (
          <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0 flex flex-row items-center justify-center">
            <Icon className="text-gray-700" fontAwesome="fas fa-tools" size={1.5} />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0 flex flex-row items-center justify-center">
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
        )}

        <div className="font-bold">Permissions</div>

        <div className="flex flex-row items-start">
          <Checkbox
            checked={checked}
            className="mr-2 mt-2 flex-shrink-0"
            onChange={(e) => {
              setApproval(e.target.checked);
            }}
          />

          <div className="text-sm mt-2">Allow host to create proof without approvals</div>
        </div>
      </FullModalContent>

      <FullModalFooter className="justify-center">
        <Button buttonType={ButtonType.SECONDARY} className="ml-2" onClick={onRemoveHost}>
          Disconnect
        </Button>

        <Button className="ml-2" onClick={onClose}>
          Close
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};
