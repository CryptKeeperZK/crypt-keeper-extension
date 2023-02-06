import React, { ReactElement, useCallback, useState } from "react";
import { createIdentity } from "@src/ui/ducks/identities";
import FullModal, { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import Dropdown from "@src/ui/components/Dropdown";
import Input from "@src/ui/components/Input";
import Button from "@src/ui/components/Button";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useMetaMaskWalletInfo } from "@src/ui/services/useMetaMask";
import { CreateIdentityWeb2Provider, CreateIdentityStrategy, CreateIdentityOptions } from "@src/types";
import { useIdentityFactory } from "@src/ui/services/useIdentityFactory";

export default function CreateIdentityModal(props: { onClose: () => void }): ReactElement {
  const [nonce, setNonce] = useState(0);
  const [identityStrategyType, setIdentityStrategyType] = useState<CreateIdentityStrategy>("interrep");
  const [web2Provider, setWeb2Provider] = useState<CreateIdentityWeb2Provider>("twitter");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const create = useCallback(async () => {
    setLoading(true);
    try {
      const walletInfo = await useMetaMaskWalletInfo();

      let options: CreateIdentityOptions = {
        nonce,
        web2Provider,
        account: walletInfo?.account,
      };
      let provider = "interrep";

      if (identityStrategyType === "random") {
        provider = "random";
        options = {};
      }

      const messageSignature = await useIdentityFactory(web2Provider, nonce);

      if (messageSignature) {
        await dispatch(createIdentity(provider, messageSignature, options));
      }

      props.onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [nonce, web2Provider, identityStrategyType]);

  return (
    <FullModal onClose={props.onClose}>
      <FullModalHeader onClose={props.onClose}>Create Identity</FullModalHeader>
      <FullModalContent>
        <Dropdown
          className="my-2"
          label="Identity type"
          options={[{ value: "interrep" }, { value: "random" }]}
          onChange={e => {
            setIdentityStrategyType(e.target.value as any);
          }}
          value={identityStrategyType}
        />
        {identityStrategyType === "interrep" && (
          <>
            <Dropdown
              className="my-2"
              label="Web2 Provider"
              options={[{ value: "twitter" }, { value: "reddit" }, { value: "github" }]}
              onChange={e => {
                setWeb2Provider(e.target.value as any);
              }}
              value={web2Provider}
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
      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}
      <FullModalFooter>
        <Button onClick={create} loading={loading}>
          Create
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
