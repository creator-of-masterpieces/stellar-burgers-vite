import { NotFound404 } from '@/pages';
import { selectIngredients } from '@/services/slices/ingredients/ingredientsSelectors';
import { fetchOrderData } from '@/services/slices/orderDetails/orderDetailsSlice';
import { useDispatch, useSelector } from '@/services/store';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type { TIngredient } from '@utils-types';

type OrderInfoProps = {
  showNumber?: boolean;
};
export const OrderInfo = ({ showNumber = false }: OrderInfoProps): React.JSX.Element => {
  const dispatch = useDispatch();
  const requestStatus = useSelector((state) => state.orderDetails.status);
  const orderNumber = Number(useParams<{ number: string }>().number);
  const isOrderNumberValid = Number.isSafeInteger(orderNumber) && orderNumber > 0;
  const ingredients: TIngredient[] = useSelector(selectIngredients);

  const orderData = useSelector((state) => state.orderDetails.order);

  useEffect(() => {
    if (!isOrderNumberValid) return;
    void dispatch(fetchOrderData(orderNumber));
  }, [dispatch, orderNumber, isOrderNumberValid]);

  /**
   * использование useMemo не обязательно
   */
  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!isOrderNumberValid) {
    return <NotFound404 />;
  }

  if (requestStatus === 'rejected') {
    return (
      <p className="text text_type_main-default text_color_inactive p-6">
        Не удалось загрузить заказ. Попробуйте открыть его ещё раз.
      </p>
    );
  }

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} showNumber={showNumber} />;
};
