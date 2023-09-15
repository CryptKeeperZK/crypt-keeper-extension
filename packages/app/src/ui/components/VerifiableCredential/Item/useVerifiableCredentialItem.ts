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

export const useVerifiableCredentialItem = ({
  metadata,
  onRename,
  onDelete,
  onSelect,
}: UseVerifiableCredentialItemArgs): IUseVerifiableCredentialItemData => {
  const { hash, name: initialName } = metadata;

  const { register, watch } = useForm<RenameVerifiableCredentialItemData>({
    defaultValues: {
      name: initialName,
    },
  });

  const name = watch("name");

  const [isRenaming, setIsRenaming] = useState(false);

  /**
   * Toggles the renaming state.
   */
  const onToggleRenaming = useCallback(() => {
    setIsRenaming((value) => !value);
  }, [setIsRenaming]);

  /**
   * Triggers renaming of the Verifiable Credential.
   */
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

  /**
   * Triggers deletion of the Verifiable Credential.
   */
  const onDeleteVC = useCallback(async () => {
    if (onDelete) {
      await onDelete(hash);
    }
  }, [onDelete, hash]);

  /**
   * Triggers selection of the Verifiable Credential.
   */
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
    onDelete: onDeleteVC,
    onToggleSelect,
  };
};
