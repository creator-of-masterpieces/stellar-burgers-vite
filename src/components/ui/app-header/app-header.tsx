import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link, NavLink } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

export const AppHeaderUI = ({
  userName,
  isConstructorActive,
}: TAppHeaderUIProps): React.JSX.Element => {
  return (
    <header className={styles.header}>
      <nav className={clsx(styles.menu, 'p-4')}>
        <div className={styles.menu_part_left}>
          <NavLink
            to={'/'}
            end
            className={() =>
              clsx(styles.link, {
                [styles.link_active]: isConstructorActive,
              })
            }
          >
            <BurgerIcon type={isConstructorActive ? 'primary' : 'secondary'} />
            <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
          </NavLink>

          <NavLink
            to={'/feed'}
            className={({ isActive }) =>
              clsx(styles.link, {
                [styles.link_active]: isActive,
              })
            }
          >
            {({ isActive }) => (
              <>
                <ListIcon type={isActive ? 'primary' : 'secondary'} />
                <p className="text text_type_main-default ml-2 mr-10">Лента заказов</p>
              </>
            )}
          </NavLink>
        </div>

        <Link to={'/'} className={styles.logo} aria-label="На главную">
          <Logo className="" />
        </Link>

        <NavLink
          to={'/profile'}
          className={({ isActive }) =>
            clsx(styles.link, styles.link_position_last, {
              [styles.link_active]: isActive,
            })
          }
        >
          {({ isActive }) => (
            <>
              <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2">
                {userName ?? 'Личный кабинет'}
              </p>
            </>
          )}
        </NavLink>
      </nav>
    </header>
  );
};
