import { orderBurgerApi } from '@/utils/burger-api';
import {
  createAsyncThunk,
  createSlice,
  nanoid,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type {
  FetchStatus,
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
  TOrder,
  TRequestError,
} from '@/utils/types';

type MoveIngredientPayload = {
  fromIndex: number;
  toIndex: number;
};

type TConstructorSliceState = TConstructorState & {
  status: FetchStatus;
  error: TRequestError;
  order: TOrder | null;
};

const initialState: TConstructorSliceState = {
  status: 'idle',
  error: null,
  bun: null,
  ingredients: [],
  order: null,
};

export const submitOrder = createAsyncThunk<TOrder, string[]>(
  'burgerConstructor/submitOrder',
  async (ingredientsId) => {
    return (await orderBurgerApi(ingredientsId)).order;
  }
);

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
    clearConstructor(state) {
      state.bun = null;
      state.ingredients = [];
    },
    resetConstructorState() {
      return initialState;
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
    builder.addCase(submitOrder.pending, (state) => {
      state.status = 'pending';
      state.error = null;
    });
    builder.addCase(submitOrder.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.order = action.payload;
      state.ingredients = [];
      state.bun = null;
      state.error = null;
    });
    builder.addCase(submitOrder.rejected, (state, action) => {
      state.status = 'rejected';
      state.error = action.error;
    });
  },
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  resetConstructorState,
} = constructorSlice.actions;
export const constructorReducer = constructorSlice.reducer;
