/* Core */
import {configureStore} from '@reduxjs/toolkit'
import {type TypedUseSelectorHook, useDispatch as useReduxDispatch, useSelector as useReduxSelector,} from 'react-redux'

/* Instruments */
import {reducer} from './rootReducer'
import {middleware} from './middleware'
import {enableMapSet} from "immer";

/* Configuration */
enableMapSet();

export const reduxStore = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(middleware)
  },
})
export const useDispatch = () => useReduxDispatch<ReduxDispatch>()
export const useSelector: TypedUseSelectorHook<ReduxState> = useReduxSelector

/* Types */
export type ReduxStore = typeof reduxStore
export type ReduxState = ReturnType<typeof reduxStore.getState>
export type ReduxDispatch = typeof reduxStore.dispatch