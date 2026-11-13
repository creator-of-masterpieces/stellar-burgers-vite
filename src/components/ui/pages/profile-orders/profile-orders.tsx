import { ProfileMenu, OrdersList } from '@components';
import { Button } from '@krgaa/react-developer-burger-ui-components';
import { Preloader } from '@ui';
import { clsx } from 'clsx';

import type { ProfileOrdersUIProps } from './type';

import styles from './profile-orders.module.css';

export const ProfileOrdersUI = ({
  orders,
  status,
  onRetry,
}: ProfileOrdersUIProps): React.JSX.Element => (
  <main className={styles.main}>
    <div className={clsx('mt-30 mr-15', styles.menu)}>
      <ProfileMenu />
    </div>
    <div className={clsx('mt-10', styles.orders)}>
      {!orders.length && (status === 'idle' || status === 'pending') && (
        <div role="status" aria-label="Загрузка истории заказов" className="p-6">
          <Preloader />
        </div>
      )}
      {status === 'rejected' && (
        <div className="p-6">
          <p role="alert" className="text text_type_main-default mb-4">
            Не удалось загрузить историю заказов.
          </p>
          <Button htmlType="button" onClick={onRetry}>
            Повторить загрузку
          </Button>
        </div>
      )}
      {orders.length > 0 && <OrdersList orders={orders} />}
      {status === 'succeeded' && !orders.length && (
        <p className="text text_type_main-default text_color_inactive p-6">
          У вас пока нет заказов.
        </p>
      )}
    </div>
  </main>
);
