import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { useDispatch as dispatchHook, useSelector as selectorHook } from 'react-redux';

import { rootReducer } from './rootReducer';
import { submitOrder } from './slices/constructor/constructorSlice';
import { fetchFeed } from './slices/feed/feedSlice';

export type RootState = ReturnType<typeof rootReducer>;

const listenerMiddleware = createListenerMiddleware<RootState>();

listenerMiddleware.startListening({
  actionCreator: submitOrder.fulfilled,
  effect: async (_, listenerApi): Promise<void> => {
    listenerApi.cancelActiveListeners();
    if (listenerApi.getState().feed.status === 'pending') {
      await listenerApi.condition(isAnyOf(fetchFeed.fulfilled, fetchFeed.rejected));
    }
    void listenerApi.dispatch(fetchFeed());
  },
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type AppDispatch = typeof store.dispatch;

export const useDispatch = dispatchHook.withTypes<AppDispatch>();
export const useSelector = selectorHook.withTypes<RootState>();

export default store;
