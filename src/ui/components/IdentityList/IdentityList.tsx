import classNames from "classnames";
import { useCallback } from "react";

import { Icon } from "@src/ui/components/Icon";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  createIdentityRequest,
  deleteIdentity,
  setActiveIdentity,
  setIdentityName,
  useSelectedIdentity,
} from "@src/ui/ducks/identities";

import type { IdentityData } from "@src/types";

import "./identityListStyles.scss";
import { IdentityItem } from "./Item";
import { IdentitiesContent } from "../IdentitiesContent";

export interface IdentityListProps {
  identities: IdentityData[];
}

export const IdentityList = ({ identities }: IdentityListProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const onCreateIdentityRequest = useCallback(() => {
    dispatch(createIdentityRequest());
  }, [dispatch]);

  return (
    <>
      <IdentitiesContent identities={identities} isShowSettings={true} />

      <div className="flex flex-row items-center p-4">
        <button
          className={classNames(
            "flex flex-row items-center justify-center cursor-pointer text-gray-600",
            "create-identity-row__active",
          )}
          data-testid="create-new-identity"
          type="button"
          onClick={onCreateIdentityRequest}
        >
          <Icon className="mr-2" fontAwesome="fas fa-plus" size={1} />

          <div>Add Identity</div>
        </button>
      </div>
    </>
  );
};
