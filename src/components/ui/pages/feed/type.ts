import type { FetchStatus, TOrder } from '@utils-types';

export type FeedUIProps = {
  orders: TOrder[];
  status: FetchStatus;
  handleGetFeeds: () => void;
};
