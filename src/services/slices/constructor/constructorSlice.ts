import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

import { submitOrder } from '../orderCreation/orderCreationSlice';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
} from '@/utils/types';

type MoveIngredientPayload = {
  fromIndex: number;
  toIndex: number;
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

export const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      prepare: (ingredient: TIngredient): { payload: TConstructorIngredient } => ({
        payload: { ...ingredient, id: nanoid() },
      }),
      reducer(state, action: PayloadAction<TConstructorIngredient>) {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
          return;
        }
        state.ingredients.push(action.payload);
      },
    },
    removeIngredient(state, action: PayloadAction<TConstructorIngredient>) {
      if (action.payload.type === 'bun') return;
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.id !== action.payload.id
      );
    },
    moveIngredient(state, action: PayloadAction<MoveIngredientPayload>) {
      const { fromIndex, toIndex } = action.payload;
      const { ingredients } = state;
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        fromIndex >= ingredients.length ||
        toIndex < 0 ||
        toIndex >= ingredients.length
      ) {
        return;
      }
      const [ingredient] = ingredients.splice(fromIndex, 1);
      ingredients.splice(toIndex, 0, ingredient);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(submitOrder.fulfilled, (state) => {
      state.ingredients = [];
      state.bun = null;
    });
  },
});

export const { addIngredient, removeIngredient, moveIngredient } =
  constructorSlice.actions;
export const constructorReducer = constructorSlice.reducer;
