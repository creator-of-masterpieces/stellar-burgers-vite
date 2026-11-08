import { getOrderByNumberApi } from '@/utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { FetchStatus, TOrder, TRequestError } from '@/utils/types';

type OrderDetailsState = {
  status: FetchStatus;
  error: TRequestError;
  order: TOrder | null;
};

const initialState: OrderDetailsState = {
  status: 'idle',
  error: null,
  order: null,
};

export const fetchOrderData = createAsyncThunk<TOrder, number>(
  'orderDetails/fetchOrderData',
  async (orderNumber) => {
    const order = await getOrderByNumberApi(orderNumber);
    if (!order.success || order.orders.length === 0) {
      throw new Error('Ошибка при загрузке заказа');
    }
    return order.orders[0];
  }
);

export const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOrderData.pending, (state) => {
      state.status = 'pending';
      state.order = null;
      state.error = null;
    });
    builder.addCase(fetchOrderData.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.order = action.payload;
    });
    builder.addCase(fetchOrderData.rejected, (state, action) => {
      state.status = 'rejected';
      state.order = null;
      state.error = action.error;
    });
  },
});

export const orderDetailsReducer = orderDetailsSlice.reducer;
