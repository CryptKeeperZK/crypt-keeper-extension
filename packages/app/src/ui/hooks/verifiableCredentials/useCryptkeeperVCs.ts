import { useEffect, useState } from "react";

import { ICryptkeeperVerifiableCredential } from "@src/types";
import { useVCs } from "@src/ui/ducks/verifiableCredentials";
import { deserializeCryptkeeperVC } from "@src/util/credentials";

export const useCryptkeeperVCs = (): ICryptkeeperVerifiableCredential[] => {
  const serializedVCs = useVCs();

  const [cryptkeeperVCs, setCryptkeeperVCs] = useState<ICryptkeeperVerifiableCredential[]>([]);

  useEffect(() => {
    async function deserializeCredentials() {
      const deserializedVCs = await Promise.all(
        serializedVCs.map((serializedVerifiableCredential) => deserializeCryptkeeperVC(serializedVerifiableCredential)),
      );
      setCryptkeeperVCs(deserializedVCs);
    }

    deserializeCredentials();
  }, [serializedVCs]);

  return cryptkeeperVCs;
};
