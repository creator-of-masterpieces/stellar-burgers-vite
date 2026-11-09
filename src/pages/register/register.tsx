import {
  selectIsUserLoading,
  selectUserError,
} from '@/services/slices/user/userSelectors';
import { clearUserError, registerUser } from '@/services/slices/user/userSlice';
import { useDispatch, useSelector } from '@/services/store';
import { PASSWORD_MIN_LENGTH } from '@/utils/validation';
import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsUserLoading);
  const error = useSelector(selectUserError);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (isLoading || password.length < PASSWORD_MIN_LENGTH) return;
    void dispatch(registerUser({ name: userName, email, password }));
  };

  return (
    <RegisterUI
      errorText={error?.message}
      isLoading={isLoading}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
