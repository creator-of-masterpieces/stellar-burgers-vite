import type { RootState } from '@/services/store';

export const selectPasswordReset = (state: RootState): RootState['passwordReset'] =>
  state.passwordReset;
