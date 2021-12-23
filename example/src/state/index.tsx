import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import application from './application/reducer'
import user from './user/reducer'
import { gelatoReducers, GELATO_PERSISTED_KEYS } from '@gelatonetwork/limit-orders-react'
import { gelatoStopLimitReducers, GELATO_STOPLIMIT_PERSISTED_KEYS } from '@gelatonetwork/stop-limit-orders-react'

const PERSISTED_KEYS: string[] = ['user', ...GELATO_PERSISTED_KEYS, ...GELATO_STOPLIMIT_PERSISTED_KEYS]

const store = configureStore({
  reducer: {
    application,
    user,
    ...gelatoReducers,
    ...gelatoStopLimitReducers,
  },
  middleware: [
    // ...getDefaultMiddleware({ thunk: false }),
    save({ states: PERSISTED_KEYS, debounce: 1000 }),
  ],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

export default store

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch