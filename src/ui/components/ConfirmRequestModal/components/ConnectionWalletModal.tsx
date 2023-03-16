import { getLinkPreview } from "link-preview-js";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { RPCAction } from "@src/constants";
import { PendingRequest } from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";
import postMessage from "@src/util/postMessage";
import metamaskLogo from "@src/static/icons/wallets/metamask.png";

import { Box, Grid } from "@mui/material";
import { useWallet } from "@src/ui/hooks/wallet";

interface ConnectionWalletModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
  accept: () => void;
  reject: () => void;
}

export function ConnectionWalletModal({
  len,
  pendingRequest,
  error,
  loading,
  accept,
  reject,
}: ConnectionWalletModalProps) {
  const { payload } = pendingRequest;
  const host = (payload as { origin: string } | undefined)?.origin ?? "";
  const [checked, setChecked] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState("");
  const { onConnect } = useWallet();

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
        Connect Wallet
        {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}
      </FullModalHeader>

      <FullModalContent className="flex flex-col items-center">
        <Box sx={{ flexGrow: 1 }}>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            alignItems="center"
            justifyContent="center"
          >
            <Grid xs={2} sm={4} md={4} key={1}>
              <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={onConnect}>
                <Icon size={3} url={metamaskLogo} />
                <span className={"ml-2"}>Metamask</span>
              </Button>
            </Grid>
          </Grid>
        </Box>
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

      <FullModalFooter>
        <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={handleReject}>
          Close
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
