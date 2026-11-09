import { fetchFeed } from '@/services/slices/feed/feedSlice';
import { useDispatch, useSelector } from '@/services/store';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import type { TOrder } from '@utils-types';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const fetchStatus = useSelector((state) => state.feed.status);
  const orders: TOrder[] = useSelector((state) => state.feed.orders);
  const isLoading = useSelector((state) => state.feed.status === 'pending');

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeed());
  };

  useEffect(() => {
    void dispatch(fetchFeed());
  }, [dispatch]);

  if (fetchStatus === 'rejected') {
    return (
      <p className="text text_type_main-default text_color_inactive p-6">
        Не удалось загрузить ленту заказов. Попробуйте обновить страницу.
      </p>
    );
  }

  if (isLoading) {
    // prettier-ignore
    return (
      <Preloader />
    );
  }

  if (fetchStatus === 'succeeded' && orders.length === 0) {
    return (
      <p className="text text_type_main-default text_color_inactive p-6">
        Заказов пока нет.
      </p>
    );
  }

  // prettier-ignore
  return (
    <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />
  );
};
