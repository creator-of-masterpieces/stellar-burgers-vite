import { fetchProfileOrders } from '@/services/slices/profileOrders/profileOrdersSlice';
import { useDispatch, useSelector } from '@/services/store';
import { ProfileOrdersUI } from '@ui-pages';
import { useEffect } from 'react';

const PROFILE_ORDERS_REFRESH_INTERVAL_MS = 10_000;

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { orders, status } = useSelector((state) => state.profileOrders);

  const handleRetry = (): void => {
    void dispatch(fetchProfileOrders());
  };

  useEffect(() => {
    let disposed = false;
    let timeout: number | undefined;
    let request: ReturnType<ReturnType<typeof fetchProfileOrders>> | undefined;
    const loadOrders = (): void => {
      if (disposed) return;
      request = dispatch(fetchProfileOrders());
      void request.then(() => {
        if (!disposed) {
          timeout = window.setTimeout(loadOrders, PROFILE_ORDERS_REFRESH_INTERVAL_MS);
        }
      });
    };
    queueMicrotask(loadOrders);

    return (): void => {
      disposed = true;
      window.clearTimeout(timeout);
      request?.abort();
    };
  }, [dispatch]);

  // prettier-ignore
  return (
    <ProfileOrdersUI orders={orders} status={status} onRetry={handleRetry} />
  );
};
