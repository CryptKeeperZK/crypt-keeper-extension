import { type ChangeEvent, type FormEvent, type MouseEvent as ReactMouseEvent, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { redirectToNewTab, replaceUrlParams } from "@src/util/browser";

import type { IdentityMetadata } from "@cryptkeeperzk/types";

export interface IUseIdentityItemArgs {
  commitment: string;
  metadata: IdentityMetadata;
  onDeleteIdentity: (commitment: string) => Promise<void>;
  onUpdateIdentityName: (commitment: string, name: string) => Promise<void>;
  onSelectIdentity?: (commitment: string) => void;
}

export interface IUseIdentityItemData {
  name: string;
  isRenaming: boolean;
  handleDeleteIdentity: () => void;
  handleSelectIdentity: () => void;
  handleChangeName: (event: ChangeEvent<HTMLInputElement>) => void;
  handleToggleRenaming: () => void;
  handleUpdateName: (event: FormEvent | ReactMouseEvent) => void;
  handleGoToHost: () => void;
  handleGoToIdentity: () => void;
}

export const useIdentityItem = ({
  metadata,
  commitment,
  onDeleteIdentity,
  onUpdateIdentityName,
  onSelectIdentity,
}: IUseIdentityItemArgs): IUseIdentityItemData => {
  const [name, setName] = useState(metadata.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const navigate = useNavigate();

  const handleDeleteIdentity = useCallback(() => {
    onDeleteIdentity(commitment);
  }, [commitment, onDeleteIdentity]);

  const handleSelectIdentity = useCallback(() => {
    onSelectIdentity?.(commitment);
  }, [commitment, onSelectIdentity]);

  const handleChangeName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    [setName],
  );

  const handleToggleRenaming = useCallback(() => {
    setIsRenaming((value) => !value);
  }, [setIsRenaming]);

  const handleUpdateName = useCallback(
    (event: FormEvent | ReactMouseEvent) => {
      event.preventDefault();
      onUpdateIdentityName(commitment, name).finally(() => {
        setIsRenaming(false);
      });
    },
    [commitment, name, onUpdateIdentityName],
  );

  const handleGoToHost = useCallback(() => {
    redirectToNewTab(metadata.host!);
  }, [metadata.host]);

  const handleGoToIdentity = useCallback(() => {
    navigate(replaceUrlParams(Paths.IDENTITY, { id: commitment }));
  }, [commitment, navigate]);

  return {
    name,
    isRenaming,
    handleDeleteIdentity,
    handleSelectIdentity,
    handleChangeName,
    handleToggleRenaming,
    handleUpdateName,
    handleGoToHost,
    handleGoToIdentity,
  };
};
