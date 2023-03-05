import React from "react";

import Button from "@src/ui/components/Button";
import Dropdown, { Option } from "@src/ui/components/Dropdown";
import FullModal, { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import Input from "@src/ui/components/Input";

import { useCreateIdentityModal } from "./useCreateIdentityModal";

export interface ICreateIdentityModalProps {
  onClose: () => void;
}

const WEB2_PROVIDER_OPTIONS: readonly Option[] = [{ value: "Twitter", label: " Twitter", icon: "fa-brands fa-twitter" }, { value: "Reddit", label: " Reddit", icon: "fa-brands fa-reddit" }, { value: "Github", label: " Github", icon: "fa-brands fa-github" }];
const IDENTITY_TYPES: readonly Option[] = [{ value: "InterRep", label: " InterRep", icon: null }, { value: "Random", label: " Random", icon: null }];

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
          label="Identity type"
          options={IDENTITY_TYPES}
          value={identityStrategyType}
          onChange={onSelectIdentityType}
        />

        {identityStrategyType === "interrep" && (
          <>
            <Dropdown
              className="my-2"
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
