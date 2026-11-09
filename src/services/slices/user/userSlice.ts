import {
  getUserApi,
  isAuthError,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  updateUserApi,
} from '@/utils/burger-api';
import { deleteCookie, getCookie, setCookie } from '@/utils/cookie';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import type { RootState } from '@/services/store';
import type { TLoginData, TRegisterData } from '@/utils/burger-api';
import type { FetchStatus, TRequestError, TUser } from '@/utils/types';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  status: FetchStatus;
  error: TRequestError;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  status: 'idle',
  error: null,
};

const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

const saveSession = (data: {
  accessToken: string;
  refreshToken: string;
  user: TUser;
}): TUser => {
  setCookie('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.user;
};

export const checkUser = createAsyncThunk<TUser | null, void, { state: RootState }>(
  'user/checkUser',
  async (_, { rejectWithValue }) => {
    if (!getCookie('accessToken') && !localStorage.getItem('refreshToken')) {
      return null;
    }

    try {
      if (!getCookie('accessToken')) await refreshToken();
      const data = await getUserApi();
      return data.user;
    } catch (error) {
      if (isAuthError(error)) {
        clearTokens();
        return rejectWithValue({ invalidSession: true });
      }
      throw error;
    }
  },
  {
    condition: (_, { getState }) => {
      const { isAuthChecked, status } = getState().user;
      return !isAuthChecked && status !== 'pending';
    },
  }
);

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (data: TRegisterData) => saveSession(await registerUserApi(data))
);

export const loginUser = createAsyncThunk('user/loginUser', async (data: TLoginData) =>
  saveSession(await loginUserApi(data))
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>) => {
    const response = await updateUserApi(data);
    return response.user;
  }
);

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  const token = localStorage.getItem('refreshToken');
  try {
    if (token) await logoutApi(token);
  } catch {
    // Failure to revoke the server session must not prevent local sign-out.
  } finally {
    clearTokens();
  }
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
        state.status = 'succeeded';
      })
      .addCase(checkUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthChecked = Boolean(action.meta.rejectedWithValue);
        state.status = action.meta.rejectedWithValue ? 'idle' : 'rejected';
        state.error = action.meta.rejectedWithValue ? null : action.error;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthChecked = true;
        state.status = 'succeeded';
        state.error = null;
      })
      .addMatcher(
        isAnyOf(registerUser.fulfilled, loginUser.fulfilled, updateUser.fulfilled),
        (state, action) => {
          state.user = action.payload;
          state.isAuthChecked = true;
          state.status = 'succeeded';
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          checkUser.pending,
          registerUser.pending,
          loginUser.pending,
          updateUser.pending,
          logoutUser.pending
        ),
        (state) => {
          state.status = 'pending';
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          registerUser.rejected,
          loginUser.rejected,
          updateUser.rejected,
          logoutUser.rejected
        ),
        (state, action) => {
          state.status = 'rejected';
          state.error = action.error;
        }
      );
  },
});

export const { clearUserError } = userSlice.actions;
export const userReducer = userSlice.reducer;
