import { useState } from "react";

import { FullModal, FullModalHeader } from "@src/ui/components/FullModal";

import FailedAddVerifiableCredential from "./FailedAddVerifiableCredential";
import RequestAddVerifiableCredential from "./RequestAddVerifiableCredential";
import SucceededAddVerifiableCredential from "./SucceededAddVerifiableCredential";
import { useAddVerifiableCredential } from "./useAddVerifiableCredential";

enum AddVerifiableCredentialState {
  REQUESTING_APPROVAL = "REQUESTING_APPROVAL",
  ADDED = "ADDED",
  FAILED_TO_ADD = "FAILED_TO_ADD",
}

const AddVerifiableCredential = (): JSX.Element => {
  const {
    closeModal,
    serializedVerifiableCredential,
    onApproveAddVerifiableCredential,
    onRejectAddVerifiableCredential,
  } = useAddVerifiableCredential();
  const [addVerifiableCredentialState, setAddVerifiableCredentialState] = useState<AddVerifiableCredentialState>(
    AddVerifiableCredentialState.REQUESTING_APPROVAL,
  );

  const onAddVerifiableCredential = async () => {
    const credentialAdded = await onApproveAddVerifiableCredential();
    if (credentialAdded) {
      setAddVerifiableCredentialState(AddVerifiableCredentialState.ADDED);
    } else {
      setAddVerifiableCredentialState(AddVerifiableCredentialState.FAILED_TO_ADD);
    }
  };

  const getModalContent = (): JSX.Element => {
    switch (addVerifiableCredentialState) {
      case AddVerifiableCredentialState.REQUESTING_APPROVAL:
        return (
          <RequestAddVerifiableCredential
            serializedVerifiableCredential={serializedVerifiableCredential}
            onAddVerifiableCredential={onAddVerifiableCredential}
            onRejectAddVerifiableCredential={onRejectAddVerifiableCredential}
          />
        );
      case AddVerifiableCredentialState.ADDED:
        return <SucceededAddVerifiableCredential closeModal={closeModal} />;
      case AddVerifiableCredentialState.FAILED_TO_ADD:
        return <FailedAddVerifiableCredential closeModal={closeModal} />;
      default:
        return <div />;
    }
  };

  return (
    <FullModal data-testid="add-verifiable-credential-page" onClose={closeModal}>
      <FullModalHeader onClose={closeModal}>Add Verifiable Credential</FullModalHeader>

      {getModalContent()}
    </FullModal>
  );
};

export default AddVerifiableCredential;
