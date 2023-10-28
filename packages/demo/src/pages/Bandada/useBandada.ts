import { encodeBytes32String } from "ethers";
import { EventName, RPCExternalAction } from "@cryptkeeperzk/providers";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { useCallback, useEffect, useState } from "react";
import { MerkleProofType } from "@src/types";
import type { IMerkleProof, IMerkleProofArtifacts, ISemaphoreFullProof } from "@cryptkeeperzk/types";
import { MERKLE_STORAGE_URL } from "@src/constants";
import { genMockIdentityCommitments } from "@src/utils";
import { toast } from "react-toastify";

interface IUseBandadaData {
    proof?: IMerkleProof,
    joinGroup: () => Promise<void>;
    generateGroupMerkleProof: () => Promise<void>;
}

export const useBandada = (): IUseBandadaData => {
    const { client } = useCryptKeeperClient();
    const [proof, setProof] = useState<IMerkleProof>();

    const joinGroup = useCallback(async () => {
        await client?.request({
            method: RPCExternalAction.JOIN_GROUP,
            payload: {
                groupId: process.env.TEST_GROUP_ID!,
                apiKey: process.env.TEST_GROUP_API_KEY,
                inviteCode: process.env.TEST_GROUP_INVITE_CODE,
            },
        });
    }, [client]);

    const generateGroupMerkleProof = useCallback(async () => {
        await client?.request({
            method: RPCExternalAction.GENERATE_GROUP_MERKLE_PROOF,
            payload: {
                groupId: process.env.TEST_GROUP_ID!,
            },
        });
    }, [client]);

    const onJoinGroup = useCallback((data: unknown) => {
        const result = data as { groupId: string };
        toast(`User has joined the group. ${result.groupId}`, { type: "success" });
    }, []);

    const onGroupMerkleProof = useCallback(
        (data: unknown) => {
            const result = data as { merkleProof: IMerkleProof };
            setProof(result.merkleProof);
            toast("Group Merkle Proof has been successfully generated!", { type: "success" });
        },
        [setProof],
    );


    // Listen to Injected CryptKeeper Provider Client Events
    useEffect(() => {
        if (!client) {
            return undefined;
        }

        client.on(EventName.JOIN_GROUP, onJoinGroup);
        client.on(EventName.GROUP_MERKLE_PROOF, onGroupMerkleProof);

        return () => {
            client.cleanListeners();
        };
    }, [
        client,
        onGroupMerkleProof,
    ]);


    return {
        proof,
        joinGroup,
        generateGroupMerkleProof
    }
};
