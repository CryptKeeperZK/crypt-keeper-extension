import { Action } from '@remix-run/router';
import { ReduxAction } from '@src/types';
import { store } from '@src/ui/store/configureAppStore'

export function useReduxDispatch(message: any): void {
    if (message?.type) {
        store.dispatch(message);
    }
}