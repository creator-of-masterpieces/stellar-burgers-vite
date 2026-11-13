import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/services/store';
import type {
  TConstructorIngredient,
  TConstructorState,
  TOrder,
  TRequestError,
} from '@/utils/types';

const selectBun = (state: RootState): TConstructorIngredient | null =>
  state.burgerConstructor.bun;
const selectFillings = (state: RootState): TConstructorIngredient[] =>
  state.burgerConstructor.ingredients;

export const selectOrder = createSelector(
  [selectBun, selectFillings],
  (bun, ingredients): string[] =>
    bun ? [bun._id, ...ingredients.map((ingredient) => ingredient._id), bun._id] : []
);

export const selectIngredientCounters = createSelector(
  [selectBun, selectFillings],
  (bun, ingredients): Record<string, number> => {
    const counters: Record<string, number> = {};
    ingredients.forEach(({ _id }) => {
      counters[_id] = (counters[_id] ?? 0) + 1;
    });
    if (bun) counters[bun._id] = 2;
    return counters;
  }
);

export const selectIsLoading = (state: RootState): boolean =>
  state.burgerConstructor.status === 'pending';

export const selectOrderModalData = (state: RootState): TOrder | null =>
  state.burgerConstructor.order;

export const selectOrderError = (state: RootState): TRequestError =>
  state.burgerConstructor.error;

export const selectConstructorItems = (state: RootState): TConstructorState =>
  state.burgerConstructor;
