import { combineReducers } from '@reduxjs/toolkit';

import { ingredientsReducer } from './slices/ingredients/ingredientsSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
});
