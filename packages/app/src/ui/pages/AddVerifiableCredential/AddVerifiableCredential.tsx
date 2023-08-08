import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";

import { deserializeVerifiableCredential, hashVerifiableCredential } from "@src/background/services/credentials/utils";
import { CryptkeeperVerifiableCredential } from "@src/types";
import { FullModal, FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialDisplay } from "@src/ui/components/VerifiableCredential";

import { useAddVerifiableCredential } from "./useAddVerifiableCredential";

const defaultVerifiableCredentialName = "Verifiable Credential";

const AddVerifiableCredential = (): JSX.Element => {
  const {
    closeModal,
    serializedVerifiableCredential,
    onApproveAddVerifiableCredential,
    onRejectAddVerifiableCredential,
  } = useAddVerifiableCredential();
  const [cryptkeeperVerifiableCredential, setCryptkeeperVerifiableCredential] = useState<
    CryptkeeperVerifiableCredential | undefined
  >(undefined);

  useEffect(() => {
    async function deserialize() {
      const deserializedVerifiableCredential = await deserializeVerifiableCredential(serializedVerifiableCredential);
      setCryptkeeperVerifiableCredential({
        verifiableCredential: deserializedVerifiableCredential,
        metadata: {
          hash: hashVerifiableCredential(deserializedVerifiableCredential),
          name: defaultVerifiableCredentialName,
        },
      });
    }
    deserialize();
  }, [serializedVerifiableCredential]);

  const onRenameVerifiableCredential = useCallback(
    (newVerifiableCredentialName: string) => {
      if (!cryptkeeperVerifiableCredential) {
        return;
      }

      setCryptkeeperVerifiableCredential({
        verifiableCredential: cryptkeeperVerifiableCredential.verifiableCredential,
        metadata: {
          hash: cryptkeeperVerifiableCredential.metadata.hash,
          name: newVerifiableCredentialName,
        },
      });
    },
    [cryptkeeperVerifiableCredential],
  );

  const onApproveVerifiableCredential = useCallback(async () => {
    if (!cryptkeeperVerifiableCredential) {
      return;
    }

    await onApproveAddVerifiableCredential(cryptkeeperVerifiableCredential.metadata.name);
    closeModal();
  }, [cryptkeeperVerifiableCredential, onApproveAddVerifiableCredential, closeModal]);

  const isError = !cryptkeeperVerifiableCredential;

  return (
    <FullModal data-testid="add-verifiable-credential-page" onClose={closeModal}>
      <FullModalHeader onClose={closeModal}>Add Verifiable Credential</FullModalHeader>

      <FullModalContent>
        <Typography>You have received a request to add a Verifiable Credential to your wallet:</Typography>

        {cryptkeeperVerifiableCredential ? (
          <VerifiableCredentialDisplay
            cryptkeeperVerifiableCredential={cryptkeeperVerifiableCredential}
            onRenameVerifiableCredential={onRenameVerifiableCredential}
          />
        ) : (
          <Typography>There was an error retrieving the Verifiable Credential.</Typography>
        )}
      </FullModalContent>

      <FullModalFooter>
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button
            disabled={isError}
            name="reject"
            sx={{ textTransform: "none" }}
            type="button"
            variant="outlined"
            onClick={onRejectAddVerifiableCredential}
          >
            Reject
          </Button>

          <Button
            disabled={isError}
            name="approve"
            sx={{ textTransform: "none" }}
            type="button"
            variant="contained"
            onClick={onApproveVerifiableCredential}
          >
            Accept
          </Button>
        </Box>
      </FullModalFooter>
    </FullModal>
  );
};

export default AddVerifiableCredential;
