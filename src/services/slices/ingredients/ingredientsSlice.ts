import { getIngredientsApi } from '@/utils/burger-api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '@/services/store';
import type { FetchStatus, TIngredient, TRequestError } from '@/utils/types';

type IngredientsState = {
  status: FetchStatus;
  ingredients: TIngredient[];
  error: TRequestError;
};

const initialState: IngredientsState = {
  status: 'idle',
  ingredients: [],
  error: null,
};

export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { state: RootState }
>('ingredients/fetchIngredients', getIngredientsApi, {
  condition: (_, { getState }) => {
    const { status } = getState().ingredients;
    return status !== 'pending' && status !== 'succeeded';
  },
});

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchIngredients.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    });
    builder.addCase(fetchIngredients.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.ingredients = action.payload;
      state.error = null;
    });
    builder.addCase(fetchIngredients.rejected, (state, action) => {
      state.status = 'rejected';
      state.error = action.error;
    });
  },
});

export const ingredientsReducer = ingredientsSlice.reducer;
