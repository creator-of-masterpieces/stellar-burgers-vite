import { OrdersList, FeedInfo } from '@components';
import { RefreshButton } from '@krgaa/react-developer-burger-ui-components';
import { Preloader } from '@ui';
import { memo } from 'react';

import type { FeedUIProps } from './type';

import styles from './feed.module.css';

export const FeedUI = memo(function FeedUI({
  orders,
  status,
  handleGetFeeds,
}: FeedUIProps): React.JSX.Element {
  return (
    <main className={styles.containerMain}>
      <div className={`${styles.titleBox} mt-10 mb-5`}>
        <h1 className="text text_type_main-large">Лента заказов</h1>
        <RefreshButton
          text="Обновить"
          onClick={handleGetFeeds}
          disabled={status === 'pending'}
          extraClass={'ml-30'}
        />
      </div>
      <div className={`${styles.statusArea} mb-5`}>
        {(status === 'idle' || status === 'pending') && (
          <div role="status">
            {orders.length ? (
              <p className="text text_type_main-default">Обновляем ленту заказов…</p>
            ) : (
              <Preloader />
            )}
          </div>
        )}
        {status === 'rejected' && (
          <p role="alert" className="text text_type_main-default">
            Не удалось загрузить ленту заказов. Нажмите «Обновить», чтобы попробовать ещё
            раз.
          </p>
        )}
        {status === 'succeeded' && orders.length === 0 && (
          <p className="text text_type_main-default text_color_inactive">
            Заказов пока нет.
          </p>
        )}
      </div>
      <div className={styles.main}>
        <div className={styles.columnOrders}>
          <OrdersList orders={orders} />
        </div>
        <div className={styles.columnInfo}>
          <FeedInfo />
        </div>
      </div>
    </main>
  );
});
