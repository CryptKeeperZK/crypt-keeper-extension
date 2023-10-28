import { RPCExternalAction } from "@cryptkeeperzk/providers";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { useCallback } from "react";

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

    return {
        importIdentity
    }
};
