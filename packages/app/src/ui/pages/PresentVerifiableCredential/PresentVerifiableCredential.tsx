import SelectVerifiableCredential from "./components/SelectVerifiableCredential";
import SignVerifiablePresentation from "./components/SignVerifiablePresentation";
import { usePresentVerifiableCredential } from "./usePresentVerifiableCredential";

const PresentVerifiableCredential = (): JSX.Element => {
  const {
    verifiablePresentationRequest,
    cryptkeeperVerifiableCredentials,
    selectedVerifiableCredentialHashes,
    displayState,
    error,
    onCloseModal,
    onRejectRequest,
    onToggleSelection,
    onConfirmSelection,
    onReturnToSelection,
    onGenerateVerifiablePresentation,
  } = usePresentVerifiableCredential();

  if (displayState === "select") {
    return (
      <SelectVerifiableCredential
        cryptkeeperVerifiableCredentials={cryptkeeperVerifiableCredentials}
        error={error}
        selectedVerifiableCredentialHashes={selectedVerifiableCredentialHashes}
        verifiablePresentationRequest={verifiablePresentationRequest}
        onCloseModal={onCloseModal}
        onConfirmSelection={onConfirmSelection}
        onRejectVerifiablePresentationRequest={onRejectRequest}
        onToggleSelectVerifiableCredential={onToggleSelection}
      />
    );
  }
  return (
    <SignVerifiablePresentation
      cryptkeeperVerifiableCredentials={cryptkeeperVerifiableCredentials}
      selectedVerifiableCredentialHashes={selectedVerifiableCredentialHashes}
      onCloseModal={onCloseModal}
      onGenerateVerifiablePresentation={onGenerateVerifiablePresentation}
      onReturnToSelection={onReturnToSelection}
    />
  );
};

export default PresentVerifiableCredential;
