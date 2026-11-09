import { NotFound404 } from '@/pages';
import { selectIngredients } from '@/services/slices/ingredients/ingredientsSelectors';
import { fetchOrderData } from '@/services/slices/orderDetails/orderDetailsSlice';
import { useDispatch, useSelector } from '@/services/store';
import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useMatch, useParams } from 'react-router-dom';

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

  const isProfileOrder = Boolean(useMatch('/profile/orders/:number'));
  const cachedOrder = useSelector((state) => {
    const sources = isProfileOrder
      ? [state.profileOrders.orders, state.feed.orders]
      : [state.feed.orders, state.profileOrders.orders];
    return (
      sources[0].find((order) => order.number === orderNumber) ??
      sources[1].find((order) => order.number === orderNumber)
    );
  });
  const fetchedOrder = useSelector((state) => state.orderDetails.order);
  const requestedNumber = useSelector((state) => state.orderDetails.requestedNumber);
  const orderData =
    cachedOrder ?? (fetchedOrder?.number === orderNumber ? fetchedOrder : null);
  const hasCachedOrder = Boolean(cachedOrder);

  useEffect(() => {
    if (!isOrderNumberValid || hasCachedOrder) return;
    const request = dispatch(fetchOrderData(orderNumber));
    return (): void => request.abort();
  }, [dispatch, orderNumber, isOrderNumberValid, hasCachedOrder]);

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
    // prettier-ignore
    return (
      <NotFound404 />
    );
  }

  if (!orderData && requestedNumber === orderNumber && requestStatus === 'rejected') {
    return (
      <p className="text text_type_main-default text_color_inactive p-6">
        Не удалось загрузить заказ. Попробуйте открыть его ещё раз.
      </p>
    );
  }

  if (!orderInfo) {
    // prettier-ignore
    return (
      <Preloader />
    );
  }

  // prettier-ignore
  return (
    <OrderInfoUI orderInfo={orderInfo} showNumber={showNumber} />
  );
};
