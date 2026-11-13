import { selectPasswordReset } from '@/services/slices/passwordReset/passwordResetSelectors';
import {
  clearPasswordResetError,
  resetPassword,
} from '@/services/slices/passwordReset/passwordResetSlice';
import { useDispatch, useSelector } from '@/services/store';
import { PASSWORD_MIN_LENGTH } from '@/utils/validation';
import { ResetPasswordUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import type { AuthLocationState } from '@utils-types';

export const ResetPassword = (): React.JSX.Element => {
  const navigate = useNavigate();
  const state = useLocation().state as AuthLocationState | null;
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const dispatch = useDispatch();
  const { status, error } = useSelector(selectPasswordReset);
  const isLoading = status === 'pending';

  useEffect(() => {
    dispatch(clearPasswordResetError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading || password.length < PASSWORD_MIN_LENGTH || !token.trim()) return;
    void dispatch(resetPassword({ password, token })).then((action) => {
      if (!resetPassword.fulfilled.match(action)) return;
      void navigate('/login', { state });
    });
  };

  useEffect(() => {
    if (!localStorage.getItem('resetPassword')) {
      void navigate('/forgot-password', { replace: true, state });
    }
  }, [navigate]);

  return (
    <ResetPasswordUI
      locationState={state}
      errorText={error?.message}
      isLoading={isLoading}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
