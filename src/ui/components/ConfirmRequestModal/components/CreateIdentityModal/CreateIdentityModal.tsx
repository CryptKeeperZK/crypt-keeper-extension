import Typography from "@mui/material/Typography";
import { Controller } from "react-hook-form";

import { getEnabledFeatures } from "@src/config/features";
import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { PendingRequest } from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Dropdown } from "@src/ui/components/Dropdown";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { IdentitiesContent } from "@src/ui/components/IdentitiesContent";
import { Input } from "@src/ui/components/Input";

import "./createIdentityStyles.scss";

import "../../confirmModal.scss";

import { useCreateIdentity } from "./useCreateIdentity";

import { WalletModal } from "@src/ui/components/WalletModal";
import { AddButton } from "@src/ui/components/AddButton";

export interface CreateIdentityModalProps {
  pendingRequest?: PendingRequest<{ host: string }>;
  accept?: () => void;
  reject?: () => void;
}

// TODO: This `CreateIdentityModal` component gets complex now.
//       Its better to be seperated to two smaller seperate modals "ConnectNewIdentityModal" and "CreateNewIdentityModal"
const CreateIdentityModal = ({ pendingRequest, accept, reject }: CreateIdentityModalProps): JSX.Element => {
  const features = getEnabledFeatures();
  const {
    isLoading,
    isProviderAvailable,
    isWalletInstalled,
    isWalletConnected,
    errors,
    control,
    host,
    faviconUrl,
    notReadyToConnect,
    randomIdentities,
    isWalletModalOpen,
    handleConnectIdentity,
    closeModal,
    onReject,
    onWalletModalShow,
    onConnectWallet,
    onCreateWithCryptkeeper,
    onCreateWithEthWallet,
  } = useCreateIdentity({ pendingRequest, accept, reject });

  return (
    <FullModal data-testid="create-identity-page" onClose={closeModal}>
      <form className="create-identity-form confirm-modal">
        <FullModalHeader onClose={closeModal}>{host ? `Connect to ${host}` : "Create a new Identity"}</FullModalHeader>

        <FullModalContent className="flex flex-col items-center">
          {/* DEPRECATED feature for first version */}
          {features.INTERREP_IDENTITY && (
            <>
              <Controller
                control={control}
                defaultValue={IDENTITY_TYPES[0]}
                name="identityStrategyType"
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    className="my-2"
                    errorMessage={errors.identityStrategyType}
                    id="identityStrategyType"
                    isDisabled={!features.INTERREP_IDENTITY}
                    label="Identity type"
                    options={IDENTITY_TYPES}
                  />
                )}
                rules={{ required: "Identity strategy type is required" }}
              />

              {isProviderAvailable && (
                <>
                  <Controller
                    control={control}
                    defaultValue={WEB2_PROVIDER_OPTIONS[0]}
                    name="web2Provider"
                    render={({ field }) => (
                      <Dropdown
                        {...field}
                        className="my-2"
                        errorMessage={errors.web2Provider}
                        id="web2Provider"
                        label="Web2 Provider"
                        options={WEB2_PROVIDER_OPTIONS}
                      />
                    )}
                    rules={{ required: "Provider is required" }}
                  />

                  <Controller
                    control={control}
                    defaultValue={0}
                    name="nonce"
                    render={({ field }) => (
                      <Input {...field} className="my-2" errorMessage={errors.nonce} id="nonce" label="Nonce" />
                    )}
                    rules={{
                      required: "Nonce is required",
                      min: { value: 0, message: "Nonce must be positive number" },
                    }}
                  />
                </>
              )}
            </>
          )}

          {/* First Condition: "Add Secret Identity" */}
          {/* This condition when user from the extension clicks on "Add Secret Identity" to just notify the user with the aviable unused identities */}
          {!host && (
            <>
              <Typography>Create your Semaphore secret identity.</Typography>
              {randomIdentities.length !== 0 && (
                <div>
                  <div className="text-sm text-gray-500 text-center">
                    You have already created {randomIdentities.length} secret identity/ies. If Are you sure you want to
                    create a new identity please click on create.
                  </div>
                  <IdentitiesContent
                    host={host}
                    identities={randomIdentities}
                    isDisableCheckClick={true}
                    isShowSettings={false}
                  />
                </div>
              )}
            </>
          )}

          {/* Second Condition: "cryptkeeper.connect()" */}
          {host && (
            <>
              <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0">
                <div
                  className="w-16 h-16"
                  style={{
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: `url(${faviconUrl})`,
                  }}
                />
              </div>

              <Typography />

              <div className="text-lg font-semibold mb-2 text-center">
                Create your Semaphore secret identity for `{host}` host
              </div>

              {randomIdentities.length === 0 && (
                <div className="text-sm text-gray-500 text-center">
                  You don't have any aviable identities created!. Please click on Create button to Create a new
                  Identity.
                </div>
              )}

              {/* This condition when user connects and there are some secrent identities "random" User can choose from or create new a one */}
              {randomIdentities.length !== 0 && (
                <>
                  <div className="text-sm text-gray-500 text-center">
                    You have already have {randomIdentities.length} random identities. Please choose one to connect
                    with, or choose to Create a new Identity.
                  </div>

                  <IdentitiesContent
                    host={host}
                    identities={randomIdentities}
                    isDisableCheckClick={false}
                    isShowSettings={false}
                  />

                  <AddButton title="Create a new Identity and Connect" action={onWalletModalShow} />
                </>
              )}
            </>
          )}
        </FullModalContent>

        {errors.root && <div className="text-xs text-red-500 text-center pb-1">{errors.root}</div>}

        <FullModalFooter>
          {host ? (
            <WalletModal
              accept={accept}
              host={host}
              isLoading={isLoading}
              isOpenModal={isWalletModalOpen}
              isWalletConnected={isWalletConnected}
              isWalletInstalled={isWalletInstalled}
              reject={onWalletModalShow}
              onConnectWallet={onConnectWallet}
              onCreateWithCryptkeeper={onCreateWithCryptkeeper}
              onCreateWithEthWallet={onCreateWithEthWallet}
            />
          ) : (
            <WalletModal
              host={host}
              isLoading={isLoading}
              isOpenModal={isWalletModalOpen}
              isWalletConnected={isWalletConnected}
              isWalletInstalled={isWalletInstalled}
              reject={onWalletModalShow}
              onConnectWallet={onConnectWallet}
              onCreateWithCryptkeeper={onCreateWithCryptkeeper}
              onCreateWithEthWallet={onCreateWithEthWallet}
            />
          )}

          <Button buttonType={ButtonType.SECONDARY} onClick={onReject}>
            Reject
          </Button>

          {host && randomIdentities.length !== 0 ? (
            <Button disabled={notReadyToConnect} className="ml-2" onClick={handleConnectIdentity}>
              Connect
            </Button>
          ) : (
            <Button className="ml-2" onClick={onWalletModalShow}>
              Create
            </Button>
          )}
        </FullModalFooter>
      </form>
    </FullModal>
  );
};

export default CreateIdentityModal;
