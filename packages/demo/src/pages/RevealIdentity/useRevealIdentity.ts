import { RPCExternalAction } from "@cryptkeeperzk/providers";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { useCallback } from "react";

interface IUseRevealIdentityData {
    revealConnectedIdentityCommitment: () => Promise<void>;
}

export const useRevealIdentity = (): IUseRevealIdentityData => {
    const { client } = useCryptKeeperClient();

    const revealConnectedIdentityCommitment = useCallback(async () => {
        await client?.request({
            method: RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
        });
    }, [client]);

    return {
        revealConnectedIdentityCommitment
    }
};
