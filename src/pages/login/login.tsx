import {
  selectIsUserLoading,
  selectUserError,
} from '@/services/slices/user/userSelectors';
import { clearUserError, loginUser } from '@/services/slices/user/userSlice';
import { useDispatch, useSelector } from '@/services/store';
import { PASSWORD_MIN_LENGTH } from '@/utils/validation';
import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsUserLoading);
  const error = useSelector(selectUserError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (isLoading || password.length < PASSWORD_MIN_LENGTH) return;
    void dispatch(loginUser({ email, password }));
  };

  return (
    <LoginUI
      errorText={error?.message}
      isLoading={isLoading}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
