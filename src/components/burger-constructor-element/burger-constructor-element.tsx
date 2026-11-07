import {
  moveIngredient,
  removeIngredient,
} from '@/services/slices/constructor/constructorSlice';
import { useDispatch } from '@/services/store';
import { BurgerConstructorElementUI } from '@ui';
import { memo } from 'react';

import type { BurgerConstructorElementProps } from './type';
import type { TConstructorIngredient } from '@/utils/types';

export const BurgerConstructorElement = memo(function BurgerConstructorElement({
  ingredient,
  index,
  totalItems,
}: BurgerConstructorElementProps): React.JSX.Element {
  const dispatch = useDispatch();
  const handleMoveDown = (): void => {
    dispatch(moveIngredient({ fromIndex: index, toIndex: index + 1 }));
  };

  const handleMoveUp = (): void => {
    dispatch(moveIngredient({ fromIndex: index, toIndex: index - 1 }));
  };

  const handleClose = (ingredient: TConstructorIngredient): void => {
    dispatch(removeIngredient(ingredient));
  };

  return (
    <BurgerConstructorElementUI
      ingredient={ingredient}
      index={index}
      totalItems={totalItems}
      handleMoveUp={handleMoveUp}
      handleMoveDown={handleMoveDown}
      handleClose={() => handleClose(ingredient)}
    />
  );
});
