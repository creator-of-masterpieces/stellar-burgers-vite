import { ProfileMenu, OrdersList } from '@components';
import { Button } from '@krgaa/react-developer-burger-ui-components';

import type { ProfileOrdersUIProps } from './type';

import styles from './profile-orders.module.css';

export const ProfileOrdersUI = ({
  orders,
  status,
  onRetry,
}: ProfileOrdersUIProps): React.JSX.Element => (
  <main className={`${styles.main}`}>
    <div className={`mt-30 mr-15 ${styles.menu}`}>
      <ProfileMenu />
    </div>
    <div className={`mt-10 ${styles.orders}`}>
      {(status === 'idle' || status === 'pending') && (
        <p role="status" className="text text_type_main-default p-6">
          Загружаем историю заказов…
        </p>
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
      {status === 'succeeded' &&
        (orders.length ? (
          <OrdersList orders={orders} />
        ) : (
          <p className="text text_type_main-default text_color_inactive p-6">
            У вас пока нет заказов.
          </p>
        ))}
    </div>
  </main>
);
