import { selectIngredientCounters } from '@/services/slices/constructor/counstructorSelectors';
import { useSelector } from '@/services/store';
import { IngredientsCategoryUI } from '@ui';

import type { TIngredientsCategoryProps } from './type';

export const IngredientsCategory = ({
  title,
  titleRef,
  ingredients,
  ref,
}: TIngredientsCategoryProps): React.JSX.Element => {
  const ingredientsCounters = useSelector(selectIngredientCounters);

  return (
    <IngredientsCategoryUI
      title={title}
      titleRef={titleRef}
      ingredients={ingredients}
      ingredientsCounters={ingredientsCounters}
      ref={ref}
    />
  );
};
