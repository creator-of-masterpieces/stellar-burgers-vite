import {
  selectFeedOrders,
  selectFeedStatus,
} from '@/services/slices/feed/feedSelectors';
import { fetchFeed } from '@/services/slices/feed/feedSlice';
import { useDispatch, useSelector } from '@/services/store';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const fetchStatus = useSelector(selectFeedStatus);
  const orders = useSelector(selectFeedOrders);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeed());
  };

  useEffect(() => {
    void dispatch(fetchFeed());
  }, [dispatch]);
  return <FeedUI orders={orders} status={fetchStatus} handleGetFeeds={handleGetFeeds} />;
};
