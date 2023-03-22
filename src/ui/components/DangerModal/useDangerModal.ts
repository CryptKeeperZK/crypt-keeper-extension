import { useCallback, useEffect, useState } from "react";

export interface IUseDangerModalData {
  onAccept: () => void;
  onReject: () => void;
}

export interface IUseDangerModalArgs {
  accept: () => void;
  reject: () => void;
}

export const useDangerModal = ({ accept, reject }: IUseDangerModalArgs): IUseDangerModalData => {
  const onAccept = useCallback(() => {
    accept();
  }, [accept]);

  const onReject = useCallback(() => {
    reject();
  }, [reject]);

  return {
    onAccept,
    onReject,
  };
};
