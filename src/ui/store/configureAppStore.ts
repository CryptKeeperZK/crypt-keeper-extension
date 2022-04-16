import { applyMiddleware, combineReducers, createStore } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import web3 from '@src/ui/ducks/web3'
import identities from '@src/ui/ducks/identities'
import requests from '@src/ui/ducks/requests'
import app from '@src/ui/ducks/app'

const rootReducer = combineReducers({
    web3,
    identities,
    requests,
    app
})

export type AppRootState = ReturnType<typeof rootReducer>

export default function configureAppStore() {
    return createStore(
        rootReducer,
        process.env.NODE_ENV !== 'production'
            ? applyMiddleware(
                  thunk,
                  createLogger({
                      collapsed: (getState, action = {}) => [''].includes(action.type)
                  })
              )
            : applyMiddleware(thunk)
    )
}
