import { selectIsUserLoading } from '@/services/slices/user/userSelectors';
import { logoutUser } from '@/services/slices/user/userSlice';
import { useDispatch, useSelector } from '@/services/store';
import { ProfileMenuUI } from '@ui';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsUserLoading);
  const [error, setError] = useState<string>();

  const handleLogout = (): void => {
    if (isLoading) return;
    setError(undefined);
    void dispatch(logoutUser()).then((action) => {
      if (logoutUser.rejected.match(action)) setError(action.error.message);
    });
  };

  return (
    <>
      <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />
      {error && (
        <p role="alert" className="text text_type_main-default">
          {error}
        </p>
      )}
    </>
  );
};
