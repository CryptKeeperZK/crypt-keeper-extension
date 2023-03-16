import React, { useCallback } from "react";

import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { Button } from "@src/ui/components/Button";
import { Dropdown } from "@src/ui/components/Dropdown";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Input } from "@src/ui/components/Input";

import { useCreateIdentityModal } from "./useCreateIdentityModal";

export interface ICreateIdentityModalProps {
  len: number;
  accept: () => void;
  reject: () => void;
}

export const CreateIdentityModal = ({ len, accept, reject }: ICreateIdentityModalProps): JSX.Element => {
  const {
    isLoading,
    error,
    nonce,
    identityStrategyType,
    web2Provider,
    closeModal,
    onChangeNonce,
    onSelectIdentityType,
    onSelectWeb2Provider,
    onCreateIdentity,
  } = useCreateIdentityModal({ accept, reject });

  const handleCreateIdentity = useCallback(() => {
    onCreateIdentity();
  }, [onCreateIdentity]);

  return (
    <FullModal data-testid="create-identity-modal" onClose={closeModal}>
      <FullModalHeader onClose={closeModal}>
        Create Identity
        {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}
      </FullModalHeader>

      <FullModalContent>
        <Dropdown
          className="my-2"
          defaultValue={IDENTITY_TYPES[0]}
          id="identityType"
          label="Identity type"
          options={IDENTITY_TYPES}
          value={identityStrategyType}
          onChange={onSelectIdentityType}
        />

        {identityStrategyType.value === "interrep" && (
          <>
            <Dropdown
              className="my-2"
              defaultValue={WEB2_PROVIDER_OPTIONS[0]}
              id="web2Provider"
              label="Web2 Provider"
              options={WEB2_PROVIDER_OPTIONS}
              value={web2Provider}
              onChange={onSelectWeb2Provider}
            />

            <Input
              className="my-2"
              defaultValue={nonce}
              label="Nonce"
              step={1}
              type="number"
              onChange={onChangeNonce}
            />
          </>
        )}
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

      <FullModalFooter>
        <Button loading={isLoading} onClick={handleCreateIdentity}>
          Create
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};
