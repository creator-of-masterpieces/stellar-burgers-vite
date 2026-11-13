import type { FetchStatus, TIngredient } from '@utils-types';

export type AppContentProps = {
  ingredients: TIngredient[];
  status: FetchStatus;
};
