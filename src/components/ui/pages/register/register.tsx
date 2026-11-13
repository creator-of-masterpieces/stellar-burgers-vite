import { useFormValidation } from '@/hooks/useFormValidation';
import { PASSWORD_MIN_LENGTH } from '@/utils/validation';
import {
  Input,
  Button,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

import type { RegisterUIProps } from './type';

import styles from '../common.module.css';

export const RegisterUI = ({
  errorText,
  email,
  setEmail,
  handleSubmit,
  password,
  setPassword,
  userName,
  setUserName,
  isLoading = false,
  locationState,
}: RegisterUIProps): React.JSX.Element => {
  const { errors, onInvalid, onBlur, onChange } = useFormValidation();
  return (
    <main className={styles.container}>
      <div className={clsx('pt-6', styles.wrapCenter)}>
        <h3 className="pb-6 text text_type_main-medium">Регистрация</h3>
        <form
          className={clsx('pb-15', styles.form)}
          name="register"
          onSubmit={handleSubmit}
          onInvalid={onInvalid}
          onBlurCapture={onBlur}
          onChange={onChange}
        >
          <>
            <div className="pb-6">
              <Input
                type="text"
                required
                placeholder="Имя"
                onChange={(e) => setUserName(e.target.value)}
                value={userName}
                name="name"
                error={!!errors.name}
                errorText={errors.name}
                aria-invalid={!!errors.name}
                size="default"
              />
            </div>
            <div className="pb-6">
              <Input
                type="email"
                required
                placeholder="E-mail"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                name={'email'}
                error={!!errors.email}
                errorText={errors.email}
                aria-invalid={!!errors.email}
                size={'default'}
              />
            </div>
            <div className="pb-6">
              <PasswordInput
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                name="password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                errorText=""
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'register-password-error' : undefined
                }
              />
              {errors.password && (
                <p
                  id="register-password-error"
                  className={clsx(styles.error, 'text text_type_main-default')}
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>
            <div className={clsx('pb-6', styles.button)}>
              <Button
                type="primary"
                size="medium"
                htmlType="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Регистрируем…' : 'Зарегистрироваться'}
              </Button>
            </div>
            {errorText && (
              <p className={clsx(styles.error, 'text text_type_main-default pb-6')}>
                {errorText}
              </p>
            )}
          </>
        </form>
        <div className={clsx(styles.question, 'text text_type_main-default pb-6')}>
          Уже зарегистрированы?
          <Link to="/login" state={locationState} className={clsx('pl-2', styles.link)}>
            Войти
          </Link>
        </div>
      </div>
    </main>
  );
};
