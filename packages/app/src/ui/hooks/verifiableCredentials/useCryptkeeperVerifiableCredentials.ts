import { useEffect, useState } from "react";

import { deserializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";
import { ICryptkeeperVerifiableCredential } from "@src/types";
import { useVerifiableCredentials } from "@src/ui/ducks/verifiableCredentials";

export const useCryptkeeperVerifiableCredentials = (): ICryptkeeperVerifiableCredential[] => {
  const serializedVerifiableCredentials = useVerifiableCredentials();

  const [cryptkeeperVerifiableCredentials, setCryptkeeperVerifiableCredentials] = useState<
    ICryptkeeperVerifiableCredential[]
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
