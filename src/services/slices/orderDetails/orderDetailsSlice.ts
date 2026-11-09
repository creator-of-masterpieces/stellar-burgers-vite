import { getOrderByNumberApi } from '@/utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { FetchStatus, TOrder, TRequestError } from '@/utils/types';

type OrderDetailsState = {
  status: FetchStatus;
  error: TRequestError;
  order: TOrder | null;
  currentRequestId: string | null;
  requestedNumber: number | null;
};

const initialState: OrderDetailsState = {
  status: 'idle',
  error: null,
  order: null,
  currentRequestId: null,
  requestedNumber: null,
};

export const fetchOrderData = createAsyncThunk<TOrder, number>(
  'orderDetails/fetchOrderData',
  async (orderNumber, { signal }) => {
    const order = await getOrderByNumberApi(orderNumber, signal);
    const matchingOrder = order.orders.find((order) => order.number === orderNumber);
    if (!order.success || !matchingOrder) {
      throw new Error('Ошибка при загрузке заказа');
    }
    return matchingOrder;
  }
);

export const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchOrderData.pending, (state, action) => {
      state.status = 'pending';
      state.order = null;
      state.error = null;
      state.currentRequestId = action.meta.requestId;
      state.requestedNumber = action.meta.arg;
    });

    builder.addCase(fetchOrderData.fulfilled, (state, action) => {
      if (state.currentRequestId !== action.meta.requestId) return;
      state.status = 'succeeded';
      state.order = action.payload;
      state.currentRequestId = null;
    });
    builder.addCase(fetchOrderData.rejected, (state, action) => {
      if (state.currentRequestId !== action.meta.requestId) return;
      state.status = 'rejected';
      state.order = null;
      state.error = action.error;
      state.currentRequestId = null;
    });
  },
});

export const orderDetailsReducer = orderDetailsSlice.reducer;
