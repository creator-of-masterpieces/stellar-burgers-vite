import type { RootState } from '@/services/store';
import type { FetchStatus, TIngredient } from '@/utils/types';
import type { SerializedError } from '@reduxjs/toolkit';

export const selectIngredients = (state: RootState): TIngredient[] => {
  return state.ingredients.ingredients;
};

export const selectIngredient =
  (id: string | undefined) =>
  (state: RootState): TIngredient | undefined => {
    if (id === undefined) {
      console.warn('Некорректный id');
      return undefined;
    }
    const ingredient = state.ingredients.ingredients.find(
      (ingredient) => ingredient._id === id
    );
    return ingredient;
  };

export const selectStatus = (state: RootState): FetchStatus => {
  return state.ingredients.status;
};

export const selectIsLoading = (state: RootState): boolean => {
  return state.ingredients.status === 'pending' || state.ingredients.status === 'idle';
};

export const selectError = (state: RootState): SerializedError | null => {
  return state.ingredients.error;
};
