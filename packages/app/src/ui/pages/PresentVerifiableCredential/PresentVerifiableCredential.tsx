import VerifiableCredentialSelector from "./components/VerifiableCredentialSelector";
import VerifiablePresentationSigner from "./components/VerifiablePresentationSigner";
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
    onSubmitWithSignature,
    onSubmitWithoutSignature,
  } = usePresentVerifiableCredential();

  if (!verifiablePresentation) {
    return (
      <VerifiableCredentialSelector
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
    <VerifiablePresentationSigner
      cryptkeeperVerifiableCredentials={cryptkeeperVerifiableCredentials}
      isWalletConnected={isWalletConnected}
      isWalletInstalled={isWalletInstalled}
      selectedVerifiableCredentialHashes={selectedVerifiableCredentialHashes}
      onCloseModal={onCloseModal}
      onConnectWallet={onConnectWallet}
      onReturnToSelection={onReturnToSelection}
      onSubmitWithSignature={onSubmitWithSignature}
      onSubmitWithoutSignature={onSubmitWithoutSignature}
    />
  );
};

export default PresentVerifiableCredential;
