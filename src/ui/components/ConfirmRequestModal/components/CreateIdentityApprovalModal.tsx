import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { PendingRequest, SelectOption } from "@src/types";
import { useCallback, useState } from "react";
import Button, { ButtonType } from "../../Button";
import { Dropdown } from "../../Dropdown";
import FullModal, { FullModalHeader, FullModalContent, FullModalFooter } from "../../FullModal";
import Input from "../../Input";

export function CreateIdentityApprovalModal(props: {
  len: number;
  reject: (error?: any) => void;
  accept: (data?: any) => void;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
}) {
  const [nonce, setNonce] = useState(0);
  const [identityType, setIdentityType] = useState(IDENTITY_TYPES[0]);
  const [web2Provider, setWeb2Provider] = useState(WEB2_PROVIDER_OPTIONS[0]);

  const create = useCallback(async () => {
    let options: any = {
      nonce,
      web2Provider,
    };
    let provider = "interrep";

    if (identityType.value === "random") {
      provider = "random";
      options = {};
    }

    props.accept({
      provider,
      options,
    });
  }, [nonce, web2Provider, identityType, props.accept]);

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Create Identity
        {props.len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${props.len}`}</div>}
      </FullModalHeader>
      <FullModalContent>
        <Dropdown
          className="my-2"
          id="identityType"
          label="Identity type"
          options={IDENTITY_TYPES}
          value={identityType}
          onChange={option => {
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
              onChange={option => {
                setWeb2Provider(option as SelectOption);
              }}
            />
            <Input
              className="my-2"
              type="number"
              label="Nonce"
              step={1}
              defaultValue={nonce}
              onChange={e => setNonce(Number(e.target.value))}
            />
          </>
        )}
      </FullModalContent>
      {props.error && <div className="text-xs text-red-500 text-center pb-1">{props.error}</div>}
      <FullModalFooter>
        <Button btnType={ButtonType.secondary} onClick={() => props.reject()} loading={props.loading}>
          Reject
        </Button>
        <Button className="ml-2" onClick={create} loading={props.loading}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
