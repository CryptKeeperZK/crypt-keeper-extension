import { IIdentityMetadata } from "@cryptkeeperzk/types";
import { type FormEvent, type MouseEvent as ReactMouseEvent, useCallback, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { redirectToNewTab, replaceUrlParams } from "@src/util/browser";

export interface IUseIdentityItemArgs {
  commitment: string;
  metadata: IIdentityMetadata;
  onDelete: (commitment: string) => Promise<void>;
  onUpdate: (commitment: string, name: string) => Promise<void>;
  onSelect?: (commitment: string) => void;
}

export interface IUseIdentityItemData {
  isRenaming: boolean;
  errors: Partial<{ root: string; name: string }>;
  register: UseFormRegister<IdentityFormFields>;
  onDeleteIdentity: () => void;
  onSelectIdentity: () => void;
  onToggleRenaming: () => void;
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
  onDelete,
  onUpdate,
  onSelect,
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

  const onSelectIdentity = useCallback(() => {
    onSelect?.(commitment);
  }, [commitment, onSelect]);

  const onToggleRenaming = useCallback(() => {
    setIsRenaming((value) => !value);
  }, [setIsRenaming]);

  const onUpdateName = useCallback(
    (data: IdentityFormFields) => {
      onUpdate(commitment, data.name)
        .then(() => setIsRenaming(false))
        .catch((err: Error) => setError("root", { message: err.message }));
    },
    [commitment, onUpdate],
  );

  const onGoToHost = useCallback(() => {
    redirectToNewTab(metadata.host!);
  }, [metadata.host]);

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
    onSelectIdentity,
    onToggleRenaming,
    onGoToHost,
    onGoToIdentity,
    onUpdateName: handleSubmit(onUpdateName),
  };
};
