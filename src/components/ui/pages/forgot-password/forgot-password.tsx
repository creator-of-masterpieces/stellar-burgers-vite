import { Input, Button } from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link, useLocation } from 'react-router-dom';

import type { PageUIProps } from '@ui-pages/common-type';
import type { AuthLocationState } from '@utils-types';

import styles from '../common.module.css';

export const ForgotPasswordUI = ({
  errorText,
  email,
  setEmail,
  handleSubmit,
  isLoading = false,
}: PageUIProps): React.JSX.Element => {
  const state = useLocation().state as AuthLocationState | null;
  return (
    <main className={styles.container}>
      <div className={clsx('pt-6', styles.wrapCenter)}>
        <h3 className="pb-6 text text_type_main-medium">Восстановление пароля</h3>
        <form
          className={clsx('pb-15', styles.form)}
          name="login"
          onSubmit={handleSubmit}
        >
          <div className="pb-6">
            <Input
              type="email"
              required
              placeholder="Укажите e-mail"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              name="email"
              error={false}
              errorText=""
              size="default"
            />
          </div>
          <div className={clsx('pb-6', styles.button)}>
            <Button type="primary" size="medium" htmlType="submit" disabled={isLoading}>
              Восстановить
            </Button>
          </div>
          {errorText && (
            <p className={clsx(styles.error, 'text text_type_main-default pb-6')}>
              {errorText}
            </p>
          )}
        </form>
        <div className={clsx(styles.question, 'text text_type_main-default pb-6')}>
          Вспомнили пароль?
          <Link to={'/login'} state={state} className={clsx('pl-2', styles.link)}>
            Войти
          </Link>
        </div>
      </div>
    </main>
  );
};
