import { useCallback, useState } from "react";
import { UseFormHandleSubmit, UseFormRegister, useForm } from "react-hook-form";

export interface RenameVerifiableCredentialDisplayData {
  name: string;
}

export interface IUseVerifiableCredentialDisplayData {
  register: UseFormRegister<RenameVerifiableCredentialDisplayData>;
  handleSubmit: UseFormHandleSubmit<RenameVerifiableCredentialDisplayData>;
  handleToggleRenaming: () => void;
  onSubmit: (data: RenameVerifiableCredentialDisplayData) => void;
  isRenaming: boolean;
  name: string;
}

export const useVerifiableCredentialDisplay = (
  initialName: string,
  onRenameVerifiableCredential: (name: string) => void,
): IUseVerifiableCredentialDisplayData => {
  const { register, handleSubmit, watch } = useForm<RenameVerifiableCredentialDisplayData>({
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
    (data: RenameVerifiableCredentialDisplayData) => {
      onRenameVerifiableCredential(data.name);
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
  };
};
