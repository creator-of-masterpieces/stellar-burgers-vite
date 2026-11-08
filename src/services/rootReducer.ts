import { combineReducers } from '@reduxjs/toolkit';

import { constructorReducer } from './slices/constructor/constructorSlice';
import { feedReducer } from './slices/feed/feedSlice';
import { ingredientsReducer } from './slices/ingredients/ingredientsSlice';
import { orderDetailsReducer } from './slices/orderDetails/orderDetailsSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  feed: feedReducer,
  orderDetails: orderDetailsReducer,
});
