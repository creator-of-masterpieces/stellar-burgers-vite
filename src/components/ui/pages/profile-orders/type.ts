import type { FetchStatus, TOrder } from '@utils-types';

export type ProfileOrdersUIProps = {
  orders: TOrder[];
  status: FetchStatus;
  onRetry: () => void;
};
