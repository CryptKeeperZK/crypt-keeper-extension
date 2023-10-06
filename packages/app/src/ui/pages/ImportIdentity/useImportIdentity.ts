import { EventName } from "@cryptkeeperzk/providers";
import { getLinkPreview } from "link-preview-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { ellipsify } from "@src/util/account";
import { redirectToNewTab } from "@src/util/browser";

export interface IUseImportIdentityData {
  error: string;
  faviconUrl: string;
  urlOrigin?: string;
  serializedIdentityTooltip?: string;
  serializedIdentity?: string;
  onGoBack: () => void;
  onGoToHost: () => void;
  onSubmit: () => void;
}

export const useImportIdentity = (): IUseImportIdentityData => {
  const [error, setError] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const urlOrigin = useSearchParam("urlOrigin");
  const identity = useSearchParam("identity");

  const identityObject = useMemo(() => {
    try {
      return JSON.parse(identity!) as Record<string, string>;
    } catch (err) {
      return undefined;
    }
  }, [identity]);

  const space = useMemo(() => (Array.isArray(identityObject) ? 0 : 4), [identityObject]);

  const serializedIdentityTooltip = useMemo(
    () => (identityObject ? JSON.stringify(identityObject, null, space) : undefined),
    [space, identityObject],
  );

  const serializedIdentity = useMemo(
    () =>
      identityObject
        ? JSON.stringify(
            Array.isArray(identityObject)
              ? identityObject.map((value) => ellipsify(value as string))
              : Object.entries(identityObject).reduce<Record<string, string>>((acc, [key, value]) => {
                  acc[key] = ellipsify(value);

                  return acc;
                }, {}),
            null,
            space,
          )
        : undefined,
    [identityObject, space],
  );

  useEffect(() => {
    if (!urlOrigin) {
      return;
    }

    getLinkPreview(urlOrigin)
      .then((data) => {
        setFaviconUrl(data.favicons[0]);
      })
      .catch(() => {
        setFaviconUrl("");
      });
  }, [urlOrigin, setFaviconUrl]);

  const onGoBack = useCallback(() => {
    dispatch(rejectUserRequest({ type: EventName.IMPORT_IDENTITY }, urlOrigin))
      .then(() => dispatch(closePopup()))
      .then(() => {
        navigate(Paths.HOME);
      });
  }, [urlOrigin, dispatch, navigate]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(urlOrigin!);
  }, [urlOrigin]);

  const onSubmit = useCallback(() => {
    setError("not implemented");
  }, [setError]);

  return {
    error,
    faviconUrl,
    urlOrigin,
    serializedIdentityTooltip,
    serializedIdentity,
    onGoBack,
    onGoToHost,
    onSubmit,
  };
};
