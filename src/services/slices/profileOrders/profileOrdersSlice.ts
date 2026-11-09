import { getOrdersApi } from '@/utils/burger-api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { checkUser, loginUser, logoutUser, registerUser } from '../user/userSlice';

import type { RootState } from '@/services/store';
import type { FetchStatus, TOrder, TRequestError } from '@/utils/types';

type TProfileOrdersState = {
  orders: TOrder[];
  status: FetchStatus;
  error: TRequestError;
  currentRequestId: string | null;
};

const initialState: TProfileOrdersState = {
  orders: [],
  status: 'idle',
  error: null,
  currentRequestId: null,
};

export const fetchProfileOrders = createAsyncThunk<TOrder[], void, { state: RootState }>(
  'profileOrders/fetchProfileOrders',
  (_, { signal }) => getOrdersApi(signal),
  {
    condition: (_, { getState }) => {
      const { user, profileOrders } = getState();
      return Boolean(user.user) && profileOrders.status !== 'pending';
    },
  }
);

export const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOrders.pending, (state, action) => {
        state.status = 'pending';
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.orders = action.payload;
        state.status = 'succeeded';
        state.currentRequestId = null;
      })
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = 'rejected';
        state.error = action.error;
        state.currentRequestId = null;
      })
      .addMatcher(
        isAnyOf(
          logoutUser.fulfilled,
          loginUser.fulfilled,
          registerUser.fulfilled,
          checkUser.rejected
        ),
        () => initialState
      );
  },
});

export const profileOrdersReducer = profileOrdersSlice.reducer;
