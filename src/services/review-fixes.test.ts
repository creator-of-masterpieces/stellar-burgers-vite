import { rootReducer } from './rootReducer';
import {
  selectIngredientCounters,
  selectOrder,
} from './slices/constructor/constructorSelectors';
import {
  addIngredient,
  clearConstructor,
  constructorReducer,
  moveIngredient,
  removeIngredient,
} from './slices/constructor/constructorSlice';
import { fetchIngredients } from './slices/ingredients/ingredientsSlice';
import {
  selectIsLoading,
  selectOrderError,
  selectOrderModalData,
} from './slices/orderCreation/orderCreationSelectors';
import { resetOrder, submitOrder } from './slices/orderCreation/orderCreationSlice';
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

test('successful order clears the burger; closing its modal preserves newly added ingredients', () => {
  let state = rootReducer(undefined, addIngredient(bun));
  state = rootReducer(state, addIngredient(filling));
  state = rootReducer(
    state,
    submitOrder.fulfilled(order, 'request', ['bun', 'filling', 'bun'])
  );
  expect(state.burgerConstructor).toEqual({ bun: null, ingredients: [] });
  expect(state.orderCreation).toEqual({
    order,
    status: 'succeeded',
    error: null,
  });
  expect(selectOrderModalData(state)).toEqual(order);
  state = rootReducer(state, addIngredient(bun));
  state = rootReducer(state, addIngredient(filling));
  const nextBurger = state.burgerConstructor;
  state = rootReducer(state, resetOrder());
  expect(state.orderCreation).toEqual({ order: null, status: 'idle', error: null });
  expect(state.burgerConstructor).toBe(nextBurger);
});

test('pending and failed order preserve the burger; retry clears the order error', () => {
  let state = rootReducer(undefined, addIngredient(bun));
  state = rootReducer(state, addIngredient(filling));
  const burger = state.burgerConstructor;
  const ingredientIds = ['bun', 'filling', 'bun'];
  state = rootReducer(state, submitOrder.pending('request', ingredientIds));
  expect(selectIsLoading(state)).toBe(true);
  expect(selectOrderError(state)).toBeNull();
  expect(state.burgerConstructor).toBe(burger);
  state = rootReducer(
    state,
    submitOrder.rejected(new Error('Server unavailable'), 'request', ingredientIds)
  );
  expect(state.orderCreation.status).toBe('rejected');
  expect(selectIsLoading(state)).toBe(false);
  expect(selectOrderError(state)).toMatchObject({ message: 'Server unavailable' });
  expect(selectOrderModalData(state)).toBeNull();
  expect(state.burgerConstructor).toBe(burger);
  state = rootReducer(state, submitOrder.pending('retry', ingredientIds));
  expect(selectIsLoading(state)).toBe(true);
  expect(selectOrderError(state)).toBeNull();
  expect(state.burgerConstructor).toBe(burger);
});

test('catalog skips requests while loading and after success', async () => {
  const store = configureStore({ reducer: rootReducer });
  let finishRequest!: (response: Response) => void;
  const pending = new Promise<Response>((resolve) => {
    finishRequest = resolve;
  });
  const fetchMock = jest.spyOn(globalThis, 'fetch').mockReturnValueOnce(pending);
  try {
    const firstRequest = store.dispatch(fetchIngredients());
    expect(store.getState().ingredients.status).toBe('pending');
    await store.dispatch(fetchIngredients());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    finishRequest(new Response(JSON.stringify({ success: true, data: [bun, filling] })));
    await firstRequest.unwrap();
    await store.dispatch(fetchIngredients());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(store.getState().ingredients.status).toBe('succeeded');
    expect(store.getState().ingredients.ingredients).toEqual([bun, filling]);
  } finally {
    fetchMock.mockRestore();
  }
});

test('catalog allows retry after a failed request', async () => {
  const store = configureStore({ reducer: rootReducer });
  const fetchMock = jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: [bun] })));
  try {
    await store.dispatch(fetchIngredients());
    expect(store.getState().ingredients.status).toBe('rejected');
    await store.dispatch(fetchIngredients()).unwrap();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.getState().ingredients.status).toBe('succeeded');
    expect(store.getState().ingredients.error).toBeNull();
    expect(store.getState().ingredients.ingredients).toEqual([bun]);
  } finally {
    fetchMock.mockRestore();
  }
});

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
import { configureStore } from '@reduxjs/toolkit';
