import { EventName, RPCExternalAction } from "@cryptkeeperzk/providers";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";

interface IUseImportIdentityData {
  importIdentity: () => Promise<void>;
}

export const useImportIdentity = (): IUseImportIdentityData => {
  const { client } = useCryptKeeperClient();

  const importIdentity = useCallback(async () => {
    const trapdoor = (document.getElementById("trapdoor") as HTMLInputElement | null)?.value ?? undefined;
    const nullifier = (document.getElementById("nullifier") as HTMLInputElement | null)?.value ?? undefined;

    await client?.request({
      method: RPCExternalAction.IMPORT_IDENTITY,
      payload: {
        trapdoor,
        nullifier,
      },
    });
  }, [client]);

  const onImportIdentity = useCallback((payload: unknown) => {
    toast(`Identity has been imported ${JSON.stringify(payload)}`, { type: "success" });
  }, []);

  // Listen to Injected CryptKeeper Provider Client Events
  useEffect(() => {
    if (!client) {
      return undefined;
    }

    client.on(EventName.IMPORT_IDENTITY, onImportIdentity);

    return () => {
      client.cleanListeners();
    };
  }, [client, onImportIdentity]);

  return {
    importIdentity,
  };
};
