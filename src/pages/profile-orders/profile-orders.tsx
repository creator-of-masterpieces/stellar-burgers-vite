import { fetchProfileOrders } from '@/services/slices/profileOrders/profileOrdersSlice';
import { useDispatch, useSelector } from '@/services/store';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, status } = useSelector((state) => state.profileOrders);

  const handleRetry = (): void => {
    void dispatch(fetchProfileOrders());
  };

  useEffect(() => {
    void dispatch(fetchProfileOrders());
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} status={status} onRetry={handleRetry} />;
};
