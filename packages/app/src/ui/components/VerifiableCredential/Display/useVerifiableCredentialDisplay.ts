import { useCallback, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";

export interface RenameVerifiableCredentialDisplayData {
  name: string;
}

export interface IUseVerifiableCredentialDisplayData {
  isRenaming: boolean;
  name: string;
  register: UseFormRegister<RenameVerifiableCredentialDisplayData>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleRenaming: () => void;
}

export interface UseVerifiableCredentialDisplayArgs {
  initialName: string;
  onRename: (name: string) => void;
}

export const useVerifiableCredentialDisplay = (
  args: UseVerifiableCredentialDisplayArgs,
): IUseVerifiableCredentialDisplayData => {
  const { initialName, onRename } = args;

  const { register, watch } = useForm<RenameVerifiableCredentialDisplayData>({
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
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onRename(name);
      setIsRenaming(false);
    },
    [onRename, name, setIsRenaming],
  );

  return {
    isRenaming,
    name,
    register,
    onSubmit,
    onToggleRenaming,
  };
};
