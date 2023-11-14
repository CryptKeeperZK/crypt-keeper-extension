import { useCallback } from "react";
import { toast } from "react-toastify";

import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";

interface IUseConnectToCK {
  connect: (isChangeIdentity: boolean) => void;
}

export const useConnect = (): IUseConnectToCK => {
  const { client, connectedIdentityMetadata } = useCryptKeeperClient();

  const connect = useCallback(
    async (isChangeIdentity = false) => {
      await client
        ?.connect(isChangeIdentity)
        .then(() => {
          if (!connectedIdentityMetadata) {
            toast(`CryptKeeper connected successfully!`, { type: "success" });
          }
        })
        .catch((error: Error) => {
          toast(error.message, { type: "error" });
        });
    },
    [client],
  );

  return {
    connect,
  };
};
