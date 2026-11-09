import { rootReducer } from './rootReducer';
import {
  addIngredient,
  clearConstructor,
  constructorReducer,
  moveIngredient,
  removeIngredient,
} from './slices/constructor/constructorSlice';
import {
  selectIngredientCounters,
  selectOrder,
} from './slices/constructor/counstructorSelectors';
import {
  fetchOrderData,
  orderDetailsReducer,
} from './slices/orderDetails/orderDetailsSlice';
import {
  fetchProfileOrders,
  profileOrdersReducer,
} from './slices/profileOrders/profileOrdersSlice';
import { loginUser, logoutUser } from './slices/user/userSlice';

import type { TIngredient, TOrder } from '@/utils/types';

const filling: TIngredient = {
  _id: 'filling',
  name: 'Начинка',
  type: 'main',
  price: 50,
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  image: '',
  image_large: '',
  image_mobile: '',
};
const bun = { ...filling, _id: 'bun', type: 'bun' };
const order: TOrder = {
  _id: 'order',
  number: 101,
  name: 'Заказ',
  status: 'pending',
  ingredients: ['bun', 'bun'],
  createdAt: '',
  updatedAt: '',
};

test('one prepared action always produces the same constructor; instances retain their IDs when moved', () => {
  const action = addIngredient(filling);
  const first = constructorReducer(undefined, action);
  expect(first.ingredients[0].id).toBe(action.payload.id);
  expect(constructorReducer(undefined, action)).toEqual(first);
  const second = addIngredient(filling);
  expect(second.payload.id).not.toBe(action.payload.id);
  const added = constructorReducer(first, second);
  const moved = constructorReducer(added, moveIngredient({ fromIndex: 0, toIndex: 1 }));
  expect(moved.ingredients.map(({ id }) => id)).toEqual([
    second.payload.id,
    action.payload.id,
  ]);
});

test('counters follow duplicate fillings, removal, bun replacement and clearing; order selector is memoized', () => {
  let state = rootReducer(undefined, { type: 'init' });
  state = rootReducer(state, addIngredient(bun));
  const firstFilling = addIngredient(filling);
  state = rootReducer(state, firstFilling);
  state = rootReducer(state, addIngredient(filling));
  expect(selectIngredientCounters(state)).toEqual({ bun: 2, filling: 2 });
  expect(selectOrder(state)).toEqual(['bun', 'filling', 'filling', 'bun']);
  const ids = selectOrder(state);
  expect(selectOrder({ ...state, feed: { ...state.feed, total: 99 } })).toBe(ids);
  state = rootReducer(state, removeIngredient(firstFilling.payload));
  expect(selectIngredientCounters(state)).toEqual({ bun: 2, filling: 1 });
  state = rootReducer(state, addIngredient({ ...bun, _id: 'other-bun' }));
  expect(selectIngredientCounters(state)).toEqual({ 'other-bun': 2, filling: 1 });
  state = rootReducer(state, clearConstructor());
  expect(selectIngredientCounters(state)).toEqual({});
  expect(selectOrder(state)).toEqual([]);
});

test('late success and failure cannot replace the latest order request', () => {
  let state = orderDetailsReducer(undefined, fetchOrderData.pending('old', 101));
  state = orderDetailsReducer(state, fetchOrderData.pending('new', 102));
  expect(
    orderDetailsReducer(state, fetchOrderData.fulfilled(order, 'old', 101))
  ).toEqual(state);
  const selectedOrder = { ...order, number: 102 };
  state = orderDetailsReducer(
    state,
    fetchOrderData.fulfilled(selectedOrder, 'new', 102)
  );
  expect(state.order).toEqual(selectedOrder);
  expect(
    orderDetailsReducer(state, fetchOrderData.fulfilled(order, 'old', 101))
  ).toEqual(state);
  expect(
    orderDetailsReducer(state, fetchOrderData.rejected(new Error('late'), 'old', 101))
  ).toEqual(state);
});

test('history ignores a previous account response after logout and a new login', () => {
  let state = profileOrdersReducer(
    undefined,
    fetchProfileOrders.pending('old', undefined)
  );
  state = profileOrdersReducer(
    state,
    logoutUser.fulfilled(undefined, 'logout', undefined)
  );
  state = profileOrdersReducer(
    state,
    loginUser.fulfilled({ name: 'Другой', email: 'other@example.com' }, 'login', {
      email: 'other@example.com',
      password: '123456',
    })
  );
  state = profileOrdersReducer(state, fetchProfileOrders.pending('new', undefined));
  state = profileOrdersReducer(
    state,
    fetchProfileOrders.fulfilled([], 'new', undefined)
  );
  expect(
    profileOrdersReducer(state, fetchProfileOrders.fulfilled([order], 'old', undefined))
  ).toEqual(state);
});
