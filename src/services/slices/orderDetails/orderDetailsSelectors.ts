import type { RootState } from '@/services/store';
import type { FetchStatus, TOrder } from '@/utils/types';

export const selectOrderDetailsStatus = (state: RootState): FetchStatus =>
  state.orderDetails.status;

export const selectOrderDetailsOrder = (state: RootState): TOrder | null =>
  state.orderDetails.order;

export const selectOrderDetailsRequestedNumber = (state: RootState): number | null =>
  state.orderDetails.requestedNumber;

export const selectCachedOrder =
  (orderNumber: number, isProfileOrder: boolean) =>
  (state: RootState): TOrder | undefined => {
    const sources = isProfileOrder
      ? [state.profileOrders.orders, state.feed.orders]
      : [state.feed.orders, state.profileOrders.orders];
    return (
      sources[0].find((order) => order.number === orderNumber) ??
      sources[1].find((order) => order.number === orderNumber)
    );
  };
