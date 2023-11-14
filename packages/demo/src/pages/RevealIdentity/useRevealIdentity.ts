import { EventName, RPCExternalAction } from "@cryptkeeperzk/providers";
import { useCallback, useEffect } from "react";

import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";

interface IUseRevealIdentityData {
  revealConnectedIdentityCommitment: () => Promise<void>;
}

export const useRevealIdentity = (): IUseRevealIdentityData => {
  const { client, setConnectedIdentityCommitment } = useCryptKeeperClient();

  const revealConnectedIdentityCommitment = useCallback(async () => {
    await client?.request({
      method: RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
    });
  }, [client]);

  const onRevealCommitment = useCallback(
    (data: unknown) => {
      setConnectedIdentityCommitment((data as { commitment: string }).commitment);
    },
    [setConnectedIdentityCommitment],
  );

  // Listen to Injected CryptKeeper Provider Client Events
  useEffect(() => {
    if (!client) {
      return undefined;
    }

    client.on(EventName.REVEAL_COMMITMENT, onRevealCommitment);

    return () => {
      client.cleanListeners();
    };
  }, [client, onRevealCommitment]);

  return {
    revealConnectedIdentityCommitment,
  };
};
