import { useCallback, useState, FormEvent as ReactFormEvent } from "react";
import { UseFormRegister, useForm } from "react-hook-form";

export interface RenameVerifiableCredentialDisplayData {
  name: string;
}

export interface IUseVerifiableCredentialDisplayData {
  isRenaming: boolean;
  name: string;
  register: UseFormRegister<RenameVerifiableCredentialDisplayData>;
  onRename: (event: ReactFormEvent<HTMLFormElement>) => void;
  onToggleRenaming: () => void;
}

export interface UseVerifiableCredentialDisplayArgs {
  initialName: string;
  onRenameVC: (name: string) => void;
}

export const useVerifiableCredentialDisplay = (
  args: UseVerifiableCredentialDisplayArgs,
): IUseVerifiableCredentialDisplayData => {
  const { initialName, onRenameVC } = args;

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

  const onRename = useCallback(
    (event: ReactFormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onRenameVC(name);
      setIsRenaming(false);
    },
    [onRenameVC, name, setIsRenaming],
  );

  return {
    isRenaming,
    name,
    register,
    onRename,
    onToggleRenaming,
  };
};
