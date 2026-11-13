import type { RootState } from '@/services/store';
import type { TOrder, TRequestError } from '@/utils/types';

export const selectIsLoading = (state: RootState): boolean =>
  state.orderCreation.status === 'pending';

export const selectOrderModalData = (state: RootState): TOrder | null =>
  state.orderCreation.order;

export const selectOrderError = (state: RootState): TRequestError =>
  state.orderCreation.error;
