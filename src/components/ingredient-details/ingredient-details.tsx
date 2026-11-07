import { NotFound404 } from '@/pages';
import { selectIngredient } from '@/services/slices/ingredients/ingredientsSelectors';
import { useSelector } from '@/services/store';
import { IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

export const IngredientDetails = (): React.JSX.Element => {
  const ingredientId = useParams<{ id: string }>().id;
  const ingredientData = useSelector((state) => selectIngredient(state, ingredientId));

  if (!ingredientData) {
    return <NotFound404 />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
