import { useCallback, useState, FormEvent as ReactFormEvent } from "react";
import { UseFormRegister, useForm } from "react-hook-form";

import { IVerifiableCredentialMetadata } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";

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
}

export interface UseVerifiableCredentialItemArgs {
  metadata: IVerifiableCredentialMetadata;
  onRename: (hash: string, name: string) => Promise<void>;
  onDelete: (hash: string) => Promise<void>;
}

export const useVerifiableCredentialItem = (
  useVerifiableCredentialItemArgs: UseVerifiableCredentialItemArgs,
): IUseVerifiableCredentialItemData => {
  const { metadata, onRename, onDelete } = useVerifiableCredentialItemArgs;
  const { hash, name: initialName } = metadata;

  const dispatch = useAppDispatch();

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
      await onRename(hash, name);
      setIsRenaming(false);
    },
    [onRename, name, setIsRenaming],
  );

  const onDeleteVerifiableCredential = useCallback(async () => {
    await onDelete(hash);
  }, [onDelete, dispatch]);

  return {
    isRenaming,
    name,
    register,
    onSubmit,
    onToggleRenaming,
    onDelete: onDeleteVerifiableCredential,
  };
};
