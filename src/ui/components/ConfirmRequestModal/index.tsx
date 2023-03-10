import React, { ReactElement, useCallback, useEffect, useState } from "react";
import FullModal, { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import Button, { ButtonType } from "@src/ui/components/Button";
import { useRequestsPending } from "@src/ui/ducks/requests";
import { PendingRequest, PendingRequestType, RequestResolutionAction, SelectOption } from "@src/types";
import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";
import "./confirm-modal.scss";
import Input from "@src/ui/components/Input";
import { Dropdown } from "@src/ui/components/Dropdown";
import Icon from "@src/ui/components/Icon";
import Checkbox from "@src/ui/components/Checkbox";
import { getLinkPreview } from "link-preview-js";
import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";

export default function ConfirmRequestModal(): ReactElement {
  const pendingRequests = useRequestsPending();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingRequest] = pendingRequests;

  const reject = useCallback(
    async (err?: any) => {
      setLoading(true);
      try {
        const id = pendingRequest?.id;
        const req: RequestResolutionAction<undefined> = {
          id,
          status: "reject",
          data: err,
        };
        await postMessage({
          method: RPCAction.FINALIZE_REQUEST,
          payload: req,
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [pendingRequest],
  );

  const approve = useCallback(
    async (data?: any) => {
      setLoading(true);
      try {
        const id = pendingRequest?.id;
        const req: RequestResolutionAction<undefined> = {
          id,
          status: "accept",
          data,
        };
        await postMessage({
          method: RPCAction.FINALIZE_REQUEST,
          payload: req,
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [pendingRequest],
  );

  if (!pendingRequest) return <></>;

  switch (pendingRequest.type) {
    case PendingRequestType.INJECT:
      return (
        <ConnectionApprovalModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={() => approve()}
          reject={() => reject()}
          error={error}
          loading={loading}
        />
      );
    case PendingRequestType.SEMAPHORE_PROOF:
    case PendingRequestType.RLN_PROOF:
      return (
        <ProofModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={() => approve()}
          reject={() => reject()}
          error={error}
          loading={loading}
        />
      );
    case PendingRequestType.DUMMY:
      return (
        <DummyApprovalModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={() => approve()}
          reject={() => reject()}
          error={error}
          loading={loading}
        />
      );
    case PendingRequestType.CREATE_IDENTITY:
      return (
        <CreateIdentityApprovalModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={approve}
          reject={reject}
          error={error}
          loading={loading}
        />
      );
    default:
      return (
        <DefaultApprovalModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={approve}
          reject={reject}
          error={error}
          loading={loading}
        />
      );
  }
}

function ConnectionApprovalModal(props: {
  len: number;
  reject: () => void;
  accept: () => void;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
}) {
  const origin = props.pendingRequest.payload?.origin;
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    (async () => {
      if (origin) {
        const res = await postMessage({
          method: RPCAction.GET_HOST_PERMISSIONS,
          payload: origin,
        });
        setChecked(res?.noApproval);
      }
    })();
  }, [origin]);

  const [faviconUrl, setFaviconUrl] = useState("");

  useEffect(() => {
    (async () => {
      if (origin) {
        const data = await getLinkPreview(origin).catch(() => undefined);
        const [favicon] = data?.favicons || [];
        setFaviconUrl(favicon);
      }
    })();
  }, [origin]);

  const setApproval = useCallback(
    async (noApproval: boolean) => {
      const res = await postMessage({
        method: RPCAction.SET_HOST_PERMISSIONS,
        payload: {
          host: origin,
          noApproval,
        },
      });
      setChecked(res?.noApproval);
    },
    [origin],
  );

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Connect with CryptKeeper
        {props.len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${props.len}`}</div>}
      </FullModalHeader>
      <FullModalContent className="flex flex-col items-center">
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
        <div className="text-lg font-semibold mb-2 text-center">
          {`${origin} would like to connect to your identity`}
        </div>
        <div className="text-sm text-gray-500 text-center">
          This site is requesting access to view your current identity. Always make sure you trust the site you interact
          with.
        </div>
        <div className="font-bold mt-4">Permissions</div>
        <div className="flex flex-row items-start">
          <Checkbox
            className="mr-2 mt-2 flex-shrink-0"
            checked={checked}
            onChange={(e) => {
              setApproval(e.target.checked);
            }}
          />
          <div className="text-sm mt-2">Allow host to create proof without approvals</div>
        </div>
      </FullModalContent>
      {props.error && <div className="text-xs text-red-500 text-center pb-1">{props.error}</div>}
      <FullModalFooter>
        <Button btnType={ButtonType.secondary} onClick={props.reject} loading={props.loading}>
          Reject
        </Button>
        <Button className="ml-2" onClick={props.accept} loading={props.loading}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}

function DummyApprovalModal(props: {
  len: number;
  reject: () => void;
  accept: () => void;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
}) {
  const { payload } = props.pendingRequest;

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Dummy Request
        {props.len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${props.len}`}</div>}
      </FullModalHeader>
      <FullModalContent className="flex flex-col">
        <div className="text-sm font-semibold mb-2">{payload}</div>
      </FullModalContent>
      {props.error && <div className="text-xs text-red-500 text-center pb-1">{props.error}</div>}
      <FullModalFooter>
        <Button btnType={ButtonType.secondary} onClick={props.reject} loading={props.loading}>
          Reject
        </Button>
        <Button className="ml-2" onClick={props.accept} loading={props.loading}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}

function CreateIdentityApprovalModal(props: {
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
              type="number"
              label="Nonce"
              step={1}
              defaultValue={nonce}
              onChange={(e) => setNonce(Number(e.target.value))}
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

function DefaultApprovalModal(props: {
  len: number;
  reject: () => void;
  accept: () => void;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
}) {
  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Unhandled Request
        {props.len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${props.len}`}</div>}
      </FullModalHeader>
      <FullModalContent className="flex flex-col">
        <div className="text-sm font-semibold mb-2 break-all">{JSON.stringify(props.pendingRequest)}</div>
      </FullModalContent>
      {props.error && <div className="text-xs text-red-500 text-center pb-1">{props.error}</div>}
      <FullModalFooter>
        <Button btnType={ButtonType.secondary} onClick={props.reject} loading={props.loading}>
          Reject
        </Button>
        <Button className="ml-2" onClick={props.accept} loading={props.loading} disabled>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}

interface ProofModalProps {
  len: number;
  reject: () => void;
  accept: () => void;
  loading: boolean;
  error: string;
  pendingRequest?: PendingRequest;
}

type ProofType = PendingRequestType.SEMAPHORE_PROOF | PendingRequestType.RLN_PROOF;

const PROOF_MODAL_TITLES: Record<ProofType, string> = {
  [PendingRequestType.SEMAPHORE_PROOF]: "Generate Semaphore Proof",
  [PendingRequestType.RLN_PROOF]: "Generate RLN Proof",
};

function ProofModal({ pendingRequest, len, reject, accept, loading, error }: ProofModalProps) {
  const { circuitFilePath, externalNullifier, signal, zkeyFilePath, origin, verificationKey } =
    pendingRequest?.payload || {};
  const operation = PROOF_MODAL_TITLES[pendingRequest?.type as ProofType] || "Generate proof";

  const [faviconUrl, setFaviconUrl] = useState("");

  useEffect(() => {
    (async () => {
      if (origin) {
        const data = await getLinkPreview(origin).catch(() => undefined);
        const [favicon] = data?.favicons || [];
        setFaviconUrl(favicon);
      }
    })();
  }, [origin]);

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        {operation}
        {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}
      </FullModalHeader>
      <FullModalContent className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0">
          <div
            className="w-16 h-16"
            style={{
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundImage: `url(${faviconUrl}`,
            }}
          />
        </div>
        <div className="text-lg font-semibold mb-2 text-center">{`${origin} is requesting a semaphore proof`}</div>
        <div className="semaphore-proof__files flex flex-row items-center mb-2">
          <div className="semaphore-proof__file">
            <div className="semaphore-proof__file__title">Circuit</div>
            <Icon fontAwesome="fas fa-link" onClick={() => window.open(circuitFilePath, "_blank")} />
          </div>
          <div className="semaphore-proof__file">
            <div className="semaphore-proof__file__title">ZKey</div>
            <Icon fontAwesome="fas fa-link" onClick={() => window.open(zkeyFilePath, "_blank")} />
          </div>
          <div className="semaphore-proof__file">
            <div className="semaphore-proof__file__title">Verification</div>
            <Icon fontAwesome="fas fa-link" onClick={() => window.open(verificationKey, "_blank")} />
          </div>
          {/* TODO: check Merkle output */}
          {/* <div className="semaphore-proof__file">
            <div className="semaphore-proof__file__title">Merkle</div>
            {typeof merkleProof === "string" ? (
              <Icon fontAwesome="fas fa-link" onClick={() => window.open(merkleProof, "_blank")} />
            ) : (
              <Icon fontAwesome="fas fa-copy" onClick={() => copy(JSON.stringify(merkleProof))} />
            )}
          </div> */}
        </div>

        <Input readOnly className="w-full mb-2" label="External Nullifier" defaultValue={externalNullifier} />
        <Input readOnly className="w-full mb-2" label="Signal" defaultValue={signal} />
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}
      <FullModalFooter>
        <Button btnType={ButtonType.secondary} onClick={reject} loading={loading}>
          Reject
        </Button>
        <Button className="ml-2" onClick={accept} loading={loading}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
}
