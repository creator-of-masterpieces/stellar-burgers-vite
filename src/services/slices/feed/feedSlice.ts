import { getFeedsApi } from '@/utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '@/services/store';
import type { TFeedState, TOrdersData } from '@/utils/types';

const initialState: TFeedState = {
  status: 'idle',
  error: null,
  orders: [],
  total: 0,
  totalToday: 0,
};

export const fetchFeed = createAsyncThunk<TOrdersData, void, { state: RootState }>(
  'feed/fetchFeed',
  () => getFeedsApi(),
  {
    condition: (_, { getState }) => getState().feed.status !== 'pending',
  }
);

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFeed.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    });
    builder.addCase(fetchFeed.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
      state.error = null;
    });
    builder.addCase(fetchFeed.rejected, (state, action) => {
      state.status = 'rejected';
      state.error = action.error;
    });
  },
});

export const feedReducer = feedSlice.reducer;
