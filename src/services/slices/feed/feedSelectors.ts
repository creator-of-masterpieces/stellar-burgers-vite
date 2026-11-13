import type { RootState } from '@/services/store';
import type { FetchStatus, TFeedState, TOrder } from '@/utils/types';

export const selectFeed = (state: RootState): TFeedState => state.feed;
export const selectFeedOrders = (state: RootState): TOrder[] => selectFeed(state).orders;
export const selectFeedStatus = (state: RootState): FetchStatus =>
  selectFeed(state).status;
