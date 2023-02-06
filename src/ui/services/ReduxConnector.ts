import { AnyAction } from "redux";
import { store } from "@src/ui/store/configureAppStore";

export function useReduxDispatch(message: AnyAction): void {
  store.dispatch(message);
}
