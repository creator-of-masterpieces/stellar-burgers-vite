import { selectPasswordReset } from '@/services/slices/passwordReset/passwordResetSelectors';
import {
  clearPasswordResetError,
  requestPasswordReset,
} from '@/services/slices/passwordReset/passwordResetSlice';
import { useDispatch, useSelector } from '@/services/store';
import { ForgotPasswordUI } from '@ui-pages';
import { useEffect, useState, type SyntheticEvent } from 'react';
import { useNavigate, useLocation, type Location } from 'react-router-dom';

export const ForgotPassword = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { status, error } = useSelector(selectPasswordReset);
  const isLoading = status === 'pending';

  useEffect(() => {
    dispatch(clearPasswordResetError());
  }, [dispatch]);

  const navigate = useNavigate();
  const state = useLocation().state as { from?: Location } | null;

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    if (isLoading) return;
    void dispatch(requestPasswordReset({ email })).then((action) => {
      if (!requestPasswordReset.fulfilled.match(action)) return;
      void navigate('/reset-password', { replace: true, state });
    });
  };

  return (
    <ForgotPasswordUI
      errorText={error?.message}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
