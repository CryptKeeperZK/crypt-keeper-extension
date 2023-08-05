import { useCallback } from "react";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { addVerifiableCredential, rejectVerifiableCredentialRequest } from "@src/ui/ducks/verifiableCredentials";

export interface IUseAddVerifiableCredentialData {
  closeModal: () => void;
  serializedVerifiableCredential: string;
  onApproveAddVerifiableCredential: () => Promise<void>;
  onRejectAddVerifiableCredential: () => void;
}

export const useAddVerifiableCredential = (): IUseAddVerifiableCredentialData => {
  const { searchParams } = new URL(window.location.href.replace("#", ""));
  const serializedVerifiableCredential = searchParams.get("serializedVerifiableCredential") || undefined;

  if (!serializedVerifiableCredential) {
    throw new Error("No serialized verifiable credential");
  }

  const dispatch = useAppDispatch();

  const closeModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  const onApproveAddVerifiableCredential = useCallback(async () => {
    await dispatch(addVerifiableCredential(serializedVerifiableCredential));
    closeModal();
  }, [dispatch, serializedVerifiableCredential, closeModal]);

  const onRejectAddVerifiableCredential = useCallback(async () => {
    await dispatch(rejectVerifiableCredentialRequest(serializedVerifiableCredential));
    closeModal();
  }, [dispatch, serializedVerifiableCredential, closeModal]);

  return {
    closeModal,
    serializedVerifiableCredential,
    onApproveAddVerifiableCredential,
    onRejectAddVerifiableCredential,
  };
};
