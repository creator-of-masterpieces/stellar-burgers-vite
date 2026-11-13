import type { RootState } from '@/services/store';

export const selectProfileOrders = (state: RootState): RootState['profileOrders'] =>
  state.profileOrders;
