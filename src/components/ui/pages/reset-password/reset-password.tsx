import { useFormValidation } from '@/hooks/useFormValidation';
import { PASSWORD_MIN_LENGTH } from '@/utils/validation';
import {
  Input,
  Button,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link, useLocation } from 'react-router-dom';

import type { ResetPasswordUIProps } from './type';
import type { AuthLocationState } from '@utils-types';

import styles from '../common.module.css';

export const ResetPasswordUI = ({
  errorText,
  password,
  setPassword,
  handleSubmit,
  token,
  setToken,
  isLoading = false,
}: ResetPasswordUIProps): React.JSX.Element => {
  const state = useLocation().state as AuthLocationState | null;
  const { errors, onInvalid, onBlur, onChange } = useFormValidation();
  return (
    <main className={styles.container}>
      <div className={clsx('pt-6', styles.wrapCenter)}>
        <h3 className="pb-6 text text_type_main-medium">Восстановление пароля</h3>
        <form
          className={clsx('pb-15', styles.form)}
          name="login"
          onSubmit={handleSubmit}
          onInvalid={onInvalid}
          onBlurCapture={onBlur}
          onChange={onChange}
        >
          <div className="pb-6">
            <PasswordInput
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              name="password"
              required
              minLength={PASSWORD_MIN_LENGTH}
              errorText=""
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'reset-password-error' : undefined}
            />
            {errors.password && (
              <p
                id="reset-password-error"
                className={clsx(styles.error, 'text text_type_main-default')}
                role="alert"
              >
                {errors.password}
              </p>
            )}
          </div>
          <div className="pb-6">
            <Input
              type="text"
              placeholder="Введите код из письма"
              onChange={(e) => setToken(e.target.value)}
              value={token}
              name="token"
              required
              error={!!errors.token}
              errorText={errors.token}
              aria-invalid={!!errors.token}
              size="default"
            />
          </div>
          <div className={clsx('pb-6', styles.button)}>
            <Button type="primary" size="medium" htmlType="submit" disabled={isLoading}>
              Сохранить
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
          <Link to="/login" state={state} className={clsx('pl-2', styles.link)}>
            Войти
          </Link>
        </div>
      </div>
    </main>
  );
};
