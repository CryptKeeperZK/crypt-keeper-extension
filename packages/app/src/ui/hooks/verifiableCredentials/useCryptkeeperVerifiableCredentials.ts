import { useEffect, useState } from "react";

import { ICryptkeeperVerifiableCredential } from "@src/types";
import { useVerifiableCredentials } from "@src/ui/ducks/verifiableCredentials";
import { deserializeCryptkeeperVerifiableCredential } from "@src/util/credentials";

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
