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
  onRename: (event: ReactFormEvent<HTMLFormElement>) => void;
  onToggleRenaming: () => void;
  onDelete: () => Promise<void>;
  onSelect: () => void;
}

export interface UseVerifiableCredentialItemArgs {
  metadata: IVerifiableCredentialMetadata;
  onRenameVC?: (hash: string, name: string) => Promise<void>;
  onDeleteVC?: (hash: string) => Promise<void>;
  onSelectVC?: (hash: string) => void;
}

export const useVerifiableCredentialItem = ({
  metadata,
  onRenameVC,
  onDeleteVC,
  onSelectVC,
}: UseVerifiableCredentialItemArgs): IUseVerifiableCredentialItemData => {
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

  const onRename = useCallback(
    async (event: ReactFormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (onRenameVC) {
        await onRenameVC(hash, name);
        setIsRenaming(false);
      }
    },
    [onRenameVC, name, setIsRenaming],
  );

  const onDelete = useCallback(async () => {
    if (onDeleteVC) {
      await onDeleteVC(hash);
    }
  }, [onDeleteVC, hash]);

  const onSelect = useCallback(() => {
    if (onSelectVC) {
      onSelectVC(hash);
    }
  }, [onSelectVC, hash]);

  return {
    isRenaming,
    name,
    register,
    onRename,
    onToggleRenaming,
    onDelete,
    onSelect,
  };
};
