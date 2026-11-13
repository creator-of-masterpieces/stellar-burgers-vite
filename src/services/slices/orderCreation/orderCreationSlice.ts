import { orderBurgerApi } from '@/utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { FetchStatus, TOrder, TRequestError } from '@/utils/types';

type TOrderCreationState = {
  status: FetchStatus;
  error: TRequestError;
  order: TOrder | null;
};

const initialState: TOrderCreationState = {
  status: 'idle',
  error: null,
  order: null,
};

export const submitOrder = createAsyncThunk<TOrder, string[]>(
  'orderCreation/submitOrder',
  async (ingredientsId) => (await orderBurgerApi(ingredientsId)).order
);

export const orderCreationSlice = createSlice({
  name: 'orderCreation',
  initialState,
  reducers: {
    resetOrder: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.status = 'pending';
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.order = action.payload;
        state.error = null;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error;
      });
  },
});

export const { resetOrder } = orderCreationSlice.actions;
export const orderCreationReducer = orderCreationSlice.reducer;
