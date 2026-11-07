import type { RootState } from '@/services/store';

export const selectOrder = (state: RootState): string[] => {
  const ingredientsId = [];
  if (!state.burgerConstructor.bun) return [];

  ingredientsId.push(state.burgerConstructor.bun._id);
  state.burgerConstructor.ingredients.forEach((ingredient) =>
    ingredientsId.push(ingredient._id)
  );
  ingredientsId.push(state.burgerConstructor.bun._id);
  return ingredientsId;
};

export const selectIsLoading = (state: RootState): boolean => {
  return state.burgerConstructor.status === 'pending';
};
