import { IIdentityMetadata } from "@cryptkeeperzk/types";
import get from "lodash/get";
import { useCallback, useEffect, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { fetchConnections, useConnectedOrigins } from "@src/ui/ducks/connections";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { deleteIdentity, fetchIdentities, setIdentityName, useIdentity } from "@src/ui/ducks/identities";
import { useUrlParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";

export interface IUseIdentityPageData {
  isLoading: boolean;
  isConfirmModalOpen: boolean;
  isUpdating: boolean;
  errors: Partial<{ root: string; name: string }>;
  urlOrigin: string;
  commitment?: string;
  metadata?: IIdentityMetadata;
  register: UseFormRegister<FormFields>;
  onGoBack: () => void;
  onConfirmDeleteIdentity: () => void;
  onDeleteIdentity: () => void;
  onUpdateIdentity: () => void;
  onGoToHost: () => void;
  onConfirmUpdate: () => void;
}

interface FormFields {
  name: string;
}

export const useIdentityPage = (): IUseIdentityPageData => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isUpdating, setUpdating] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const commitment = useUrlParam("id");
  const identity = useIdentity(commitment);
  const connectedOrigins = useConnectedOrigins();
  const urlOrigin = connectedOrigins[get(identity, "commitment")!];

  const {
    formState: { errors, isSubmitting },
    setError,
    setValue,
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: identity?.metadata.name || "",
    },
  });

  const onGoBack = useCallback(() => {
    navigate(Paths.HOME);
  }, [navigate]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([dispatch(fetchIdentities()), dispatch(fetchConnections())])
      .catch((err: Error) => {
        setError("root", { message: err.message });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, setIsLoading, setError]);

  useEffect(() => {
    if (!identity?.metadata.name) {
      return;
    }

    setValue("name", identity.metadata.name);
  }, [identity?.metadata.name]);

  const onConfirmDeleteIdentity = useCallback(() => {
    setConfirmModalOpen((value) => !value);
  }, [setConfirmModalOpen]);

  const onDeleteIdentity = useCallback(() => {
    dispatch(deleteIdentity(commitment!))
      .then(() => {
        setConfirmModalOpen(false);
      })
      .then(() => {
        navigate(Paths.HOME);
      })
      .catch((err: Error) => {
        setError("root", { message: err.message });
      });
  }, [commitment, dispatch, navigate, setConfirmModalOpen, setError]);

  const onUpdateIdentity = useCallback(() => {
    setUpdating((value) => !value);
  }, [setUpdating]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(urlOrigin);
  }, [urlOrigin]);

  const onConfirmUpdate = useCallback(
    (data: FormFields) => {
      dispatch(setIdentityName(commitment!, data.name))
        .then(() => {
          setUpdating(false);
        })
        .catch((err: Error) => {
          setError("root", { message: err.message });
        });
    },
    [commitment, dispatch, setUpdating, setError],
  );

  return {
    isLoading: isLoading || isSubmitting,
    isConfirmModalOpen,
    isUpdating,
    errors: {
      root: errors.root?.message,
      name: errors.name?.message,
    },
    commitment: identity?.commitment,
    metadata: identity?.metadata,
    urlOrigin,
    register,
    onGoBack,
    onConfirmDeleteIdentity,
    onDeleteIdentity,
    onUpdateIdentity,
    onGoToHost,
    onConfirmUpdate: handleSubmit(onConfirmUpdate),
  };
};
