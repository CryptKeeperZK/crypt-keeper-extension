import { useCallback, useState } from "react";
import { UseFormHandleSubmit, UseFormRegister, useForm } from "react-hook-form";

import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface RenameVerifiableCredentialItemData {
  name: string;
}

export interface IUseVerifiableCredentialItemData {
  register: UseFormRegister<RenameVerifiableCredentialItemData>;
  handleSubmit: UseFormHandleSubmit<RenameVerifiableCredentialItemData>;
  handleToggleRenaming: () => void;
  onSubmit: (data: RenameVerifiableCredentialItemData) => Promise<void>;
  isRenaming: boolean;
  name: string;
  handleDeleteVerifiableCredential: () => Promise<void>;
}

export const useVerifiableCredentialItem = (
  initialName: string,
  hash: string,
  onRenameVerifiableCredential: (hash: string, name: string) => Promise<void>,
  onDeleteVerifiableCredential: (hash: string) => Promise<void>,
): IUseVerifiableCredentialItemData => {
  const dispatch = useAppDispatch();

  const handleDeleteVerifiableCredential = useCallback(async () => {
    await onDeleteVerifiableCredential(hash);
  }, [onDeleteVerifiableCredential, dispatch]);

  const { register, handleSubmit, watch } = useForm<RenameVerifiableCredentialItemData>({
    defaultValues: {
      name: initialName,
    },
  });

  const name = watch("name");

  const [isRenaming, setIsRenaming] = useState(false);

  const handleToggleRenaming = useCallback(() => {
    setIsRenaming((value) => !value);
  }, [setIsRenaming]);

  const onSubmit = useCallback(
    async (data: RenameVerifiableCredentialItemData) => {
      await onRenameVerifiableCredential(hash, data.name);
      setIsRenaming(false);
    },
    [onRenameVerifiableCredential],
  );

  return {
    register,
    handleSubmit,
    handleToggleRenaming,
    onSubmit,
    isRenaming,
    name,
    handleDeleteVerifiableCredential,
  };
};
