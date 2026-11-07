import { combineReducers } from '@reduxjs/toolkit';

import { constructorReducer } from './slices/constructor/constructorSlice';
import { ingredientsReducer } from './slices/ingredients/ingredientsSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
});
