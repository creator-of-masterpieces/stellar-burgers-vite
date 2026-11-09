import { ProfileMenu } from '@components';
import { Button, Input } from '@krgaa/react-developer-burger-ui-components';

import type { ProfileUIProps } from './type';

import styles from './profile.module.css';

export const ProfileUI = ({
  formValue,
  isFormChanged,
  isLoading = false,
  updateUserError,
  handleSubmit,
  handleCancel,
  handleInputChange,
}: ProfileUIProps): React.JSX.Element => (
  <main className={styles.container}>
    <div className={styles.menu}>
      <ProfileMenu />
    </div>
    <form className={styles.form} onSubmit={handleSubmit}>
      <>
        <div className="pb-6">
          <Input
            type={'text'}
            placeholder={'Имя'}
            onChange={handleInputChange}
            value={formValue.name}
            name={'name'}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        <div className="pb-6">
          <Input
            type={'email'}
            placeholder={'E-mail'}
            onChange={handleInputChange}
            value={formValue.email}
            name={'email'}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        <div className="pb-6">
          <Input
            type={'password'}
            placeholder={'Пароль'}
            onChange={handleInputChange}
            value={formValue.password}
            name={'password'}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        {isFormChanged && (
          <div>
            <Button
              type="secondary"
              htmlType="button"
              size="medium"
              onClick={handleCancel}
            >
              Отменить
            </Button>
            <Button type="primary" size="medium" htmlType="submit" disabled={isLoading}>
              {isLoading ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </div>
        )}
        {updateUserError && (
          <p className={`${styles.error} pt-5 text text_type_main-default`}>
            {updateUserError}
          </p>
        )}
      </>
    </form>
  </main>
);
