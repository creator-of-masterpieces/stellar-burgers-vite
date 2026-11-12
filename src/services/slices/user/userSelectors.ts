import type { RootState } from '@/services/store';
import type { FetchStatus, TRequestError, TUser } from '@/utils/types';

export const selectUser = (state: RootState): TUser | null => state.user.user;
export const selectUserStatus = (state: RootState): FetchStatus => state.user.status;
export const selectIsAuthChecked = (state: RootState): boolean =>
  state.user.isAuthChecked;
export const selectIsUserLoading = (state: RootState): boolean =>
  state.user.status === 'pending';
export const selectUserError = (state: RootState): TRequestError => state.user.error;
