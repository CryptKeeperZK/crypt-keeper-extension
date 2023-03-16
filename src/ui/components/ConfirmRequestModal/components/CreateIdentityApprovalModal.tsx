import { useCallback, useState } from "react";

import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { IdentityStrategy, SelectOption } from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Dropdown } from "@src/ui/components/Dropdown";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Input } from "@src/ui/components/Input";

interface CreateIdentityApprovalModalProps {
  len: number;
  loading: boolean;
  error: string;
  accept: (data?: {
    provider: IdentityStrategy;
    options: Partial<{ nonce: number; web2Provider: SelectOption }>;
  }) => void;
  reject: (error?: Error) => void;
}

export default function CreateIdentityApprovalModal({
  len,
  loading,
  error,
  accept,
  reject,
}: CreateIdentityApprovalModalProps) {
  const [nonce, setNonce] = useState(0);
  const [identityType, setIdentityType] = useState(IDENTITY_TYPES[0]);
  const [web2Provider, setWeb2Provider] = useState(WEB2_PROVIDER_OPTIONS[0]);

  const handleApprove = useCallback(() => {
    const options = identityType.value !== "random" ? { nonce, web2Provider } : {};
    const provider = identityType.value as IdentityStrategy;

    accept({ provider, options });
  }, [nonce, web2Provider, identityType, accept]);

  const handleReject = useCallback(() => {
    reject();
  }, [reject]);

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Create Identity
        {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}
      </FullModalHeader>

      <FullModalContent>
        <Dropdown
          className="my-2"
          id="identityType"
          label="Identity type"
          options={IDENTITY_TYPES}
          value={identityType}
          onChange={(option) => {
            setIdentityType(option as SelectOption);
          }}
        />

        {identityType.value === "interrep" && (
          <>
            <Dropdown
              className="my-2"
              id="web2Provider"
              label="Web2 Provider"
              options={WEB2_PROVIDER_OPTIONS}
              value={web2Provider}
              onChange={(option) => {
                setWeb2Provider(option as SelectOption);
              }}
            />

            <Input
              className="my-2"
              defaultValue={nonce}
              label="Nonce"
              step={1}
              type="number"
              onChange={(e) => setNonce(Number(e.target.value))}
            />
          </>
        )}
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

      <FullModalFooter>
        <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={handleReject}>
          Reject
        </Button>

        <Button className="ml-2" loading={loading} onClick={handleApprove}>
          Create
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
