import { selectProfileOrders } from '@/services/slices/profileOrders/profileOrdersSelectors';
import { fetchProfileOrders } from '@/services/slices/profileOrders/profileOrdersSlice';
import { useDispatch, useSelector } from '@/services/store';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, status } = useSelector(selectProfileOrders);

  const handleRetry = (): void => {
    void dispatch(fetchProfileOrders());
  };

  useEffect(() => {
    let disposed = false;
    let request: ReturnType<ReturnType<typeof fetchProfileOrders>> | undefined;
    queueMicrotask(() => {
      if (!disposed) {
        request = dispatch(fetchProfileOrders());
      }
    });

    return (): void => {
      disposed = true;
      request?.abort();
    };
  }, [dispatch]);

  // prettier-ignore
  return (
    <ProfileOrdersUI orders={orders} status={status} onRetry={handleRetry} />
  );
};
