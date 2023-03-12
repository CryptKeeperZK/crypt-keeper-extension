import { RPCAction } from "@src/constants";
import { Action } from "@src/types";
import { useSelector } from "react-redux";
import { AppRootState } from "../store/configureAppStore";
import deepEqual from "fast-deep-equal";

export enum WalletActionType {
  GET_CONNECT_WALLET = "app/wallet/get/connect",
  SET_CONNECT_WALLET = "app/wallet/connect",
}

type State = {
  isDisconnectedPermanently: Boolean;
};

const initialState: State = {
  isDisconnectedPermanently: false,
};

export const setWalletConnection = (connection: {
  isDisconnectedPermanently: Boolean;
}): Action<
  WalletActionType,
  {
    isDisconnectedPermanently: Boolean;
  }
> => ({
  type: WalletActionType.SET_CONNECT_WALLET,
  payload: connection,
});

export const fetchConnection = () => async () => {
  postMessage({
    method: RPCAction.GET_CONNECT_WALLET,
  });
};

export default function wallets(
  state = initialState,
  action: Action<
    WalletActionType,
    {
      isDisconnectedPermanently: Boolean;
    }
  >,
): State {
  switch (action.type) {
    case WalletActionType.SET_CONNECT_WALLET:
      return {
        ...state,
        isDisconnectedPermanently: action.payload ? action.payload.isDisconnectedPermanently : false,
      };
    default:
      return state;
  }
}

export const useWallets = () => useSelector((state: AppRootState) => state.wallets, deepEqual);
