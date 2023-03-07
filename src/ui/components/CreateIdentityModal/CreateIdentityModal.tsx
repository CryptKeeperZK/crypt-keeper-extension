import React from "react";

import Button from "@src/ui/components/Button";
import { Dropdown } from "@src/ui/components/Dropdown";
import FullModal, { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import Input from "@src/ui/components/Input";

import { useCreateIdentityModal } from "./useCreateIdentityModal";
import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";

export interface ICreateIdentityModalProps {
  onClose: () => void;
}

export function CreateIdentityModal({ onClose }: ICreateIdentityModalProps): JSX.Element {
  const {
    isLoading,
    error,
    nonce,
    identityStrategyType,
    web2Provider,
    onChangeNonce,
    onSelectIdentityType,
    onSelectWeb2Provider,
    onCreateIdentity,
  } = useCreateIdentityModal({ onClose });

  return (
    <FullModal data-testid="create-identity-modal" onClose={onClose}>
      <FullModalHeader onClose={onClose}>Create Identity</FullModalHeader>

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
              type="number"
              label="Nonce"
              step={1}
              defaultValue={nonce}
              onChange={onChangeNonce}
            />
          </>
        )}
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

      <FullModalFooter>
        <Button onClick={onCreateIdentity} loading={isLoading}>
          Create
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
