import classNames from "classnames";
import { useCallback } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentityRequest } from "@src/ui/ducks/identities";

import type { IdentityData } from "@src/types";

import "./homeIdentityListStyles.scss";

import { IdentitiesContent } from "../IdentitiesContent";
import { AddButton } from "../AddButton";

export interface IdentityListProps {
  identities: IdentityData[];
}

export const HomeIdentityList = ({ identities }: IdentityListProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const onCreateIdentityRequest = useCallback(() => {
    dispatch(createIdentityRequest());
  }, [dispatch]);

  return (
    <>
      <IdentitiesContent isDisableCheckClick isShowSettings identities={identities} />

      <AddButton title="Add Secret Identity" action={onCreateIdentityRequest} />
    </>
  );
};
