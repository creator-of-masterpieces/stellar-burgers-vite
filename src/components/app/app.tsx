import {
  selectError,
  selectIngredients,
  selectIsLoading,
} from '@/services/slices/ingredients/ingredientsSelectors';
import { fetchIngredients } from '@/services/slices/ingredients/ingredientsSlice';
import { checkUser } from '@/services/slices/user/userSlice';
import { useDispatch, useSelector } from '@/services/store';
import { AppHeader } from '@components';
import { Preloader } from '@ui';
import { useEffect } from 'react';

import { RouteComponent } from '@components/routes/routes.tsx';

import type { AppContentProps } from './type';
import type { TIngredient } from '@utils-types';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients: TIngredient[] = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIsLoading);
  const ingredientsError = useSelector(selectError);

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUser());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        ingredients={ingredients}
        isLoading={isIngredientsLoading}
        error={ingredientsError}
      />
    </div>
  );
};

export default App;

/* Маршруты показываются только когда ингредиенты загружены: без них не
   отрисовать ни конструктор, ни состав заказа. */
const AppContent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>
        Не удалось загрузить ингредиенты. Попробуйте обновить страницу.
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>Нет ингредиентов</p>
    );
  }

  return <RouteComponent />;
};
