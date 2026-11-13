import type { TConstructorState, TOrder } from '@utils-types';

export type BurgerConstructorUIProps = {
  constructorItems: TConstructorState;
  orderRequest: boolean;
  price: number;
  orderModalData: TOrder | null;
  errorText?: string;
  onOrderClick: () => void;
  closeOrderModal: () => void;
};
