import { useCallback, useState, FormEvent as ReactFormEvent } from "react";
import { UseFormRegister, useForm } from "react-hook-form";

import type { IVerifiableCredentialMetadata } from "@src/types";

export interface RenameVerifiableCredentialItemData {
  name: string;
}

export interface IUseVerifiableCredentialItemData {
  isRenaming: boolean;
  name: string;
  register: UseFormRegister<RenameVerifiableCredentialItemData>;
  onSubmit: (event: ReactFormEvent<HTMLFormElement>) => void;
  onToggleRenaming: () => void;
  onDelete: () => Promise<void>;
  onToggleSelect: () => void;
}

export interface UseVerifiableCredentialItemArgs {
  metadata: IVerifiableCredentialMetadata;
  onRename?: (hash: string, name: string) => Promise<void>;
  onDelete?: (hash: string) => Promise<void>;
  onSelect?: (hash: string) => void;
}

export const useVerifiableCredentialItem = (
  useVerifiableCredentialItemArgs: UseVerifiableCredentialItemArgs,
): IUseVerifiableCredentialItemData => {
  const { metadata, onRename, onDelete, onSelect } = useVerifiableCredentialItemArgs;
  const { hash, name: initialName } = metadata;

  const { register, watch } = useForm<RenameVerifiableCredentialItemData>({
    defaultValues: {
      name: initialName,
    },
  });

  const name = watch("name");

  const [isRenaming, setIsRenaming] = useState(false);

  const onToggleRenaming = useCallback(() => {
    setIsRenaming((value) => !value);
  }, [setIsRenaming]);

  const onSubmit = useCallback(
    async (event: ReactFormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (onRename) {
        await onRename(hash, name);
        setIsRenaming(false);
      }
    },
    [onRename, name, setIsRenaming],
  );

  const onDeleteVerifiableCredential = useCallback(async () => {
    if (onDelete) {
      await onDelete(hash);
    }
  }, [onDelete, hash]);

  const onToggleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(hash);
    }
  }, [onSelect, hash]);

  return {
    isRenaming,
    name,
    register,
    onSubmit,
    onToggleRenaming,
    onDelete: onDeleteVerifiableCredential,
    onToggleSelect,
  };
};
