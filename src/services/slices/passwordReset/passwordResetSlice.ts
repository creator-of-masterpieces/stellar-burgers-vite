import { forgotPasswordApi, resetPasswordApi } from '@/utils/burger-api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import type { RootState } from '@/services/store';
import type { FetchStatus, TRequestError } from '@/utils/types';

type PasswordResetState = {
  status: FetchStatus;
  error: TRequestError;
};

const initialState: PasswordResetState = { status: 'idle', error: null };

export const requestPasswordReset = createAsyncThunk<
  void,
  { email: string },
  { state: RootState }
>(
  'passwordReset/request',
  async (data) => {
    await forgotPasswordApi(data);
    localStorage.setItem('resetPassword', 'true');
  },
  { condition: (_, { getState }) => getState().passwordReset.status !== 'pending' }
);

export const resetPassword = createAsyncThunk<
  void,
  { password: string; token: string },
  { state: RootState }
>(
  'passwordReset/reset',
  async (data) => {
    await resetPasswordApi(data);
    localStorage.removeItem('resetPassword');
  },
  { condition: (_, { getState }) => getState().passwordReset.status !== 'pending' }
);

const passwordResetSlice = createSlice({
  name: 'passwordReset',
  initialState,
  reducers: {
    clearPasswordResetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(requestPasswordReset.pending, resetPassword.pending),
        (state) => {
          state.status = 'pending';
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(requestPasswordReset.fulfilled, resetPassword.fulfilled),
        (state) => {
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        isAnyOf(requestPasswordReset.rejected, resetPassword.rejected),
        (state, action) => {
          state.status = 'rejected';
          state.error = action.error;
        }
      );
  },
});

export const { clearPasswordResetError } = passwordResetSlice.actions;
export const passwordResetReducer = passwordResetSlice.reducer;
