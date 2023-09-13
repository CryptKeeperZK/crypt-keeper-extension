import { useParams, useSearchParams } from "react-router-dom";

export const useUrlParam = (param: string): string | undefined => {
  const params = useParams();

  return params[param];
};

export const useSearchParam = (param: string): string | undefined => {
  const [params] = useSearchParams();

  return params.get(param) ?? undefined;
};
