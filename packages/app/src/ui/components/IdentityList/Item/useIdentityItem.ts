import { IIdentityMetadata } from "@cryptkeeperzk/types";
import { type FormEvent, type MouseEvent as ReactMouseEvent, useCallback, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { redirectToNewTab, replaceUrlParams } from "@src/util/browser";

export interface IUseIdentityItemArgs {
  commitment: string;
  metadata: IIdentityMetadata;
  connectedOrigin?: string;
  onDelete: (commitment: string) => Promise<void>;
  onUpdate: (commitment: string, name: string) => Promise<void>;
  onDisconnect: (commitment: string) => Promise<void>;
  onSelect?: (commitment: string) => void;
}

export interface IUseIdentityItemData {
  isRenaming: boolean;
  errors: Partial<{ root: string; name: string }>;
  register: UseFormRegister<IdentityFormFields>;
  onDeleteIdentity: () => void;
  onSelectIdentity: () => void;
  onToggleRenaming: () => void;
  onDisconnectIdentity: () => void;
  onGoToHost: () => void;
  onGoToIdentity: () => void;
  onUpdateName: (event: FormEvent | ReactMouseEvent) => void;
}

interface IdentityFormFields {
  name: string;
}

export const useIdentityItem = ({
  metadata,
  commitment,
  connectedOrigin,
  onDelete,
  onUpdate,
  onSelect,
  onDisconnect,
}: IUseIdentityItemArgs): IUseIdentityItemData => {
  const [isRenaming, setIsRenaming] = useState(false);
  const navigate = useNavigate();

  const {
    formState: { errors },
    setError,
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: metadata.name,
    },
  });

  const onDeleteIdentity = useCallback(() => {
    onDelete(commitment);
  }, [commitment, onDelete]);

  const onDisconnectIdentity = useCallback(() => {
    onDisconnect(commitment);
  }, [commitment, onDisconnect]);

  const onSelectIdentity = useCallback(() => {
    onSelect?.(commitment);
  }, [commitment, onSelect]);

  const onToggleRenaming = useCallback(() => {
    setIsRenaming((value) => !value);
  }, [setIsRenaming]);

  const onUpdateName = useCallback(
    (data: IdentityFormFields) => {
      onUpdate(commitment, data.name)
        .then(() => {
          setIsRenaming(false);
        })
        .catch((err: Error) => {
          setError("root", { message: err.message });
        });
    },
    [commitment, onUpdate],
  );

  const onGoToHost = useCallback(() => {
    redirectToNewTab(connectedOrigin!);
  }, [connectedOrigin]);

  const onGoToIdentity = useCallback(() => {
    navigate(replaceUrlParams(Paths.IDENTITY, { id: commitment }));
  }, [commitment, navigate]);

  return {
    isRenaming,
    errors: {
      root: errors.root?.message,
      name: errors.name?.message,
    },
    register,
    onDeleteIdentity,
    onDisconnectIdentity,
    onSelectIdentity,
    onToggleRenaming,
    onGoToHost,
    onGoToIdentity,
    onUpdateName: handleSubmit(onUpdateName),
  };
};
