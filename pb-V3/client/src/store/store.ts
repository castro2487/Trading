import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import webSocketReducer from 'services/webSocketSlice'
import graphReducer from 'features/Chart/chartSlice';
import positionsReducer from './positionsSlice';
import settingsReducer from './settingsSlice';
import authenticationReducer from './authentication';

import wsMiddleware from 'services/wsMiddleware';


export const store = configureStore({
  reducer: {
    websocket: webSocketReducer,
    graphData: graphReducer,
    positions: positionsReducer,
    settings: settingsReducer,
    authentication: authenticationReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }).concat(wsMiddleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
