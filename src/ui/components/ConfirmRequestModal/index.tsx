import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useState } from "react";

import { RPCAction, IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import {
  IdentityStrategy,
  PendingRequest,
  PendingRequestType,
  RequestResolutionAction,
  SelectOption,
} from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Checkbox } from "@src/ui/components/Checkbox";
import { Dropdown } from "@src/ui/components/Dropdown";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";
import { Input } from "@src/ui/components/Input";
import { useRequestsPending } from "@src/ui/ducks/requests";
import postMessage from "@src/util/postMessage";

import "./confirm-modal.scss";

interface ConnectionModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
  accept: () => void;
  reject: () => void;
}

const ConnectionApprovalModal = ({ len, pendingRequest, error, loading, accept, reject }: ConnectionModalProps) => {
  const { payload } = pendingRequest;
  const host = (payload as { origin: string } | undefined)?.origin ?? "";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (host) {
      postMessage<{ noApproval: boolean }>({
        method: RPCAction.GET_HOST_PERMISSIONS,
        payload: host,
      }).then((res) => setChecked(res?.noApproval));
    }
  }, [host, setChecked]);

  const [faviconUrl, setFaviconUrl] = useState("");

  useEffect(() => {
    if (host) {
      getLinkPreview(host)
        .then((data) => {
          const [favicon] = data.favicons;
          setFaviconUrl(favicon);
        })
        .catch(() => undefined);
    }
  }, [host, setFaviconUrl]);

  const onSetApproval = useCallback(
    (noApproval: boolean) => {
      postMessage<{ noApproval: boolean }>({
        method: RPCAction.SET_HOST_PERMISSIONS,
        payload: {
          host,
          noApproval,
        },
      }).then((res) => setChecked(res?.noApproval));
    },
    [host, setChecked],
  );

  return (
    <FullModal className="confirm-modal" onClose={() => null}>
      <FullModalHeader>
        Connect with CryptKeeper
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
              backgroundImage: `url(${faviconUrl})`,
            }}
          />
        </div>

        <div className="text-lg font-semibold mb-2 text-center">{`${host} would like to connect to your identity`}</div>

        <div className="text-sm text-gray-500 text-center">
          This site is requesting access to view your current identity. Always make sure you trust the site you interact
          with.
        </div>

        <div className="font-bold mt-4">Permissions</div>

        <div className="flex flex-row items-start">
          <Checkbox
            checked={checked}
            className="mr-2 mt-2 flex-shrink-0"
            onChange={(e) => {
              onSetApproval(e.target.checked);
            }}
          />

          <div className="text-sm mt-2">Allow host to create proof without approvals</div>
        </div>
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

      <FullModalFooter>
        <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={reject}>
          Reject
        </Button>

        <Button className="ml-2" loading={loading} onClick={accept}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};

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

const CreateIdentityApprovalModal = ({ len, loading, error, accept, reject }: CreateIdentityApprovalModalProps) => {
  const [nonce, setNonce] = useState(0);
  const [identityType, setIdentityType] = useState(IDENTITY_TYPES[0]);
  const [web2Provider, setWeb2Provider] = useState(WEB2_PROVIDER_OPTIONS[0]);

  const onApprove = useCallback(() => {
    const options = identityType.value !== "random" ? { nonce, web2Provider } : {};
    const provider = identityType.value as IdentityStrategy;

    accept({ provider, options });
  }, [nonce, web2Provider, identityType, accept]);

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
        <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={() => reject()}>
          Reject
        </Button>

        <Button className="ml-2" loading={loading} onClick={onApprove}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};

interface DefaultApprovalModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
  accept: () => void;
  reject: () => void;
}

const DefaultApprovalModal = ({ len, loading, error, pendingRequest, accept, reject }: DefaultApprovalModalProps) => (
  <FullModal className="confirm-modal" onClose={() => null}>
    <FullModalHeader>
      Unhandled Request
      {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}
    </FullModalHeader>

    <FullModalContent className="flex flex-col">
      <div className="text-sm font-semibold mb-2 break-all">{JSON.stringify(pendingRequest)}</div>
    </FullModalContent>

    {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

    <FullModalFooter>
      <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={reject}>
        Reject
      </Button>

      <Button disabled className="ml-2" loading={loading} onClick={accept}>
        Approve
      </Button>
    </FullModalFooter>
  </FullModal>
);

interface ProofModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest;
  accept: () => void;
  reject: () => void;
}

type ProofType = PendingRequestType.SEMAPHORE_PROOF | PendingRequestType.RLN_PROOF;

const PROOF_MODAL_TITLES: Record<ProofType, string> = {
  [PendingRequestType.SEMAPHORE_PROOF]: "Generate Semaphore Proof",
  [PendingRequestType.RLN_PROOF]: "Generate RLN Proof",
};

interface ProofRequest {
  externalNullifier: string;
  signal: string;
  merkleStorageAddress?: string;
  circuitFilePath: string;
  verificationKey: string;
  zkeyFilePath: string;
  origin: string;
}

const ProofModal = ({ pendingRequest, len, reject, accept, loading, error }: ProofModalProps) => {
  const { payload } = pendingRequest;
  const {
    circuitFilePath,
    externalNullifier,
    signal,
    zkeyFilePath,
    origin: host = "",
    verificationKey,
  } = (payload || {}) as Partial<ProofRequest>;
  const operation = PROOF_MODAL_TITLES[pendingRequest?.type as ProofType] || "Generate proof";

  const [faviconUrl, setFaviconUrl] = useState("");

  useEffect(() => {
    (async () => {
      if (host) {
        const data = await getLinkPreview(host).catch(() => undefined);
        const [favicon] = data?.favicons || [];
        setFaviconUrl(favicon);
      }
    })();
  }, [host]);

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

        <div className="text-lg font-semibold mb-2 text-center">{`${host} is requesting a semaphore proof`}</div>

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

        <Input readOnly className="w-full mb-2" defaultValue={externalNullifier} label="External Nullifier" />

        <Input readOnly className="w-full mb-2" defaultValue={signal} label="Signal" />
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

      <FullModalFooter>
        <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={reject}>
          Reject
        </Button>

        <Button className="ml-2" loading={loading} onClick={accept}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};

export const ConfirmRequestModal = (): JSX.Element | null => {
  const pendingRequests = useRequestsPending();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingRequest] = pendingRequests;

  const reject = useCallback(
    (err?: Error) => {
      const req: RequestResolutionAction<Error | undefined> = {
        id: pendingRequest?.id,
        status: "reject",
        data: err,
      };

      setLoading(true);
      postMessage({
        method: RPCAction.FINALIZE_REQUEST,
        payload: req,
      })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [pendingRequest, setLoading, setError],
  );

  const approve = useCallback(
    (data?: unknown) => {
      const req: RequestResolutionAction<unknown | undefined> = {
        id: pendingRequest?.id,
        status: "accept",
        data,
      };

      setLoading(true);
      postMessage({
        method: RPCAction.FINALIZE_REQUEST,
        payload: req,
      })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [pendingRequest, setError, setLoading],
  );

  if (!pendingRequest) {
    return null;
  }

  switch (pendingRequest.type) {
    case PendingRequestType.INJECT:
      return (
        <ConnectionApprovalModal
          accept={() => approve()}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest}
          reject={() => reject()}
        />
      );
    case PendingRequestType.SEMAPHORE_PROOF:
    case PendingRequestType.RLN_PROOF:
      return (
        <ProofModal
          accept={approve}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest}
          reject={reject}
        />
      );
    case PendingRequestType.CREATE_IDENTITY:
      return (
        <CreateIdentityApprovalModal
          accept={approve}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          reject={reject}
        />
      );
    default:
      return (
        <DefaultApprovalModal
          accept={approve}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest}
          reject={reject}
        />
      );
  }
};
