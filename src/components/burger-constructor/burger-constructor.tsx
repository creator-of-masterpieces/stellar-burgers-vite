import { resetOrder, submitOrder } from '@/services/slices/constructor/constructorSlice';
import {
  selectIsLoading,
  selectOrder,
} from '@/services/slices/constructor/counstructorSelectors';
import { selectIsAuthChecked, selectUser } from '@/services/slices/user/userSelectors';
import { useDispatch, useSelector } from '@/services/store';
import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { TConstructorIngredient, TConstructorState, TOrder } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const constructorItems: TConstructorState = useSelector(
    (state) => state.burgerConstructor
  );
  const order = useSelector(selectOrder);
  const orderRequest = useSelector(selectIsLoading);
  const orderModalData: TOrder | null = useSelector(
    (state) => state.burgerConstructor.order
  );
  const orderError = useSelector((state) => state.burgerConstructor.error);

  const onOrderClick = (): void => {
    if (!constructorItems.bun || orderRequest || !order.length) return;
    if (!isAuthChecked) return;
    if (!user) {
      void navigate('/login', { state: { from: location } });
      return;
    }
    void dispatch(submitOrder(order));
  };

  const closeOrderModal = (): void => {
    if (orderRequest) return;
    dispatch(resetOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      errorText={
        orderError ? 'Не удалось оформить заказ. Попробуйте ещё раз.' : undefined
      }
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
