import { useEffect, useState } from "react";

import { deserializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";
import { CryptkeeperVerifiableCredential } from "@src/types";
import { useVerifiableCredentials } from "@src/ui/ducks/verifiableCredentials";

export const useCryptkeeperVerifiableCredentials = (): CryptkeeperVerifiableCredential[] => {
  const serializedVerifiableCredentials = useVerifiableCredentials();

  const [cryptkeeperVerifiableCredentials, setCryptkeeperVerifiableCredentials] = useState<
    CryptkeeperVerifiableCredential[]
  >([]);

  useEffect(() => {
    async function deserializeCredentials() {
      const deserializedVerifiableCredentials = await Promise.all(
        serializedVerifiableCredentials.map((serializedVerifiableCredential) =>
          deserializeCryptkeeperVerifiableCredential(serializedVerifiableCredential),
        ),
      );
      setCryptkeeperVerifiableCredentials(deserializedVerifiableCredentials);
    }
    deserializeCredentials();
  }, [serializedVerifiableCredentials]);

  return cryptkeeperVerifiableCredentials;
};
