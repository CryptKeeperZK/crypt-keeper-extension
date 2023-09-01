import SelectVerifiableCredential from "./components/SelectVerifiableCredential";
import SignVerifiablePresentation from "./components/SignVerifiablePresentation";
import { usePresentVerifiableCredential } from "./usePresentVerifiableCredential";

const PresentVerifiableCredential = (): JSX.Element => {
  const {
    isWalletConnected,
    isWalletInstalled,
    verifiablePresentationRequest,
    cryptkeeperVerifiableCredentials,
    selectedVerifiableCredentialHashes,
    verifiablePresentation,
    error,
    onCloseModal,
    onRejectRequest,
    onToggleSelection,
    onConfirmSelection,
    onReturnToSelection,
    onConnectWallet,
    onSubmitVerifiablePresentation,
  } = usePresentVerifiableCredential();

  if (!verifiablePresentation) {
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
      isWalletConnected={isWalletConnected}
      isWalletInstalled={isWalletInstalled}
      selectedVerifiableCredentialHashes={selectedVerifiableCredentialHashes}
      onCloseModal={onCloseModal}
      onConnectWallet={onConnectWallet}
      onReturnToSelection={onReturnToSelection}
      onSubmitVerifiablePresentation={onSubmitVerifiablePresentation}
    />
  );
};

export default PresentVerifiableCredential;
