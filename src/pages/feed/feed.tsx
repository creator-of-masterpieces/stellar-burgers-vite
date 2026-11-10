import { fetchFeed } from '@/services/slices/feed/feedSlice';
import { useDispatch, useSelector } from '@/services/store';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import type { TOrder } from '@utils-types';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const fetchStatus = useSelector((state) => state.feed.status);
  const orders: TOrder[] = useSelector((state) => state.feed.orders);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeed());
  };

  useEffect(() => {
    void dispatch(fetchFeed());
  }, [dispatch]);
  return <FeedUI orders={orders} status={fetchStatus} handleGetFeeds={handleGetFeeds} />;
};
