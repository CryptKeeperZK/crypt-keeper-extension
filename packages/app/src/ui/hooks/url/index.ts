import { useParams } from "react-router-dom";

export const useUrlParam = (param: string): string | undefined => {
  const params = useParams();

  return params[param];
};
