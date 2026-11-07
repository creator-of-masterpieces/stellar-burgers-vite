import {
  resetConstructorState,
  submitOrder,
} from '@/services/slices/constructor/constructorSlice';
import {
  selectIsLoading,
  selectOrder,
} from '@/services/slices/constructor/counstructorSelectors';
import { useDispatch, useSelector } from '@/services/store';
import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';

import type { TConstructorIngredient, TConstructorState, TOrder } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const constructorItems: TConstructorState = useSelector(
    (state) => state.burgerConstructor
  );
  const order = useSelector(selectOrder);
  const orderRequest = useSelector(selectIsLoading);
  const orderModalData: TOrder | null = useSelector(
    (state) => state.burgerConstructor.order
  );

  const onOrderClick = (): void => {
    if (!constructorItems.bun || orderRequest || !order.length) return;
    void dispatch(submitOrder(order));
  };

  const closeOrderModal = (): void => {
    if (orderRequest) return;
    dispatch(resetConstructorState());
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
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
