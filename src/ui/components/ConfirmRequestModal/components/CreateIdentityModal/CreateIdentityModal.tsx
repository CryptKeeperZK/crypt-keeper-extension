import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Controller } from "react-hook-form";
import { ButtonType, Button } from "@src/ui/components/Button";

import { getEnabledFeatures } from "@src/config/features";
import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { Dropdown } from "@src/ui/components/Dropdown";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";

import "./createIdentityStyles.scss";
import "../../confirmModal.scss";
import { useCreateIdentity } from "./useCreateIdentity";
import { PendingRequest } from "@src/types";
import { IdentitiesContent } from "@src/ui/components/IdentitiesContent";
import { WalletModal } from "@src/ui/components/WalletModal";

export interface CreateIdentityModalProps {
  pendingRequest?: PendingRequest<{ host: string }>;
  accept?: () => void;
  reject?: () => void;
}

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
    randomIdentities,
    isWalletModalOpen,
    closeModal,
    onAccept, 
    onReject,
    onWalletModalShow,
    onConnectWallet,
    onCreateWithCryptkeeper,
    onCreateWithEthWallet,
  } = useCreateIdentity({ pendingRequest, accept, reject });

  return (
    <FullModal data-testid="create-identity-page" onClose={closeModal}>
      <form className="create-identity-form">
        <FullModalHeader onClose={closeModal}>Create a new Identity</FullModalHeader>

        <FullModalContent>
          {features.INTERREP_IDENTITY ? (
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
          ) : host ? (
            <div>
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

              <Typography></Typography>

              <div className="text-lg font-semibold mb-2 text-center">Create your Semaphore identity for `{host}` host</div>

              <div className="text-sm text-gray-500 text-center">
                You have already {randomIdentities.length} random identities. Please choose one to connect
                with, or choose to create a new identity.
              </div>
              <IdentitiesContent identities={randomIdentities} isShowSettings={false} />
            </div>
          ) : (
            <Typography>Create your Semaphore random identity.</Typography>
          )}
        </FullModalContent>

        {errors.root && <div className="text-xs text-red-500 text-center pb-1">{errors.root}</div>}
        <FullModalFooter>

          <WalletModal host={host} isOpenModal={isWalletModalOpen} isLoading={isLoading} isWalletConnected={isWalletConnected} isWalletInstalled={isWalletInstalled} onConnectWallet={onConnectWallet} onCreateWithEthWallet={onCreateWithEthWallet} onCreateWithCryptkeeper={onCreateWithCryptkeeper} reject={onWalletModalShow} accept={accept}/>

          <Button buttonType={ButtonType.SECONDARY} onClick={onReject}>
            Reject
          </Button>

          <Button className="ml-2" onClick={onWalletModalShow}>
            Sign
          </Button>
        </FullModalFooter>
      </form>
    </FullModal>
  );
};

export default CreateIdentityModal;
