/* eslint css-modules/no-unused-class: ["warn", { markAsUsed: ["app", "message"] }] -- Используются в app.tsx. */
import {
  selectIsAuthChecked,
  selectUser,
  selectUserStatus,
} from '@/services/slices/user/userSelectors';
import { checkUser } from '@/services/slices/user/userSlice';
import { useDispatch, useSelector } from '@/services/store';
import { ORDER_NUMBER_MIN_LENGTH } from '@/utils/constants';
import { Button } from '@krgaa/react-developer-burger-ui-components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { Preloader } from '@ui';
import {
  Navigate,
  Route,
  Routes,
  Outlet,
  useNavigate,
  useLocation,
  type Location,
  useMatch,
} from 'react-router-dom';

import { IngredientDetails } from '@components/ingredient-details';
import { Modal } from '@components/modal';
import { OrderInfo } from '@components/order-info';

import type { AuthLocationState } from '@utils-types';

import appStyles from '../app/app.module.css';
import styles from './routes.module.css';

type ModalLocationState = {
  background?: Location;
};

export const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderMatch = useMatch('/feed/:number');
  const profileOrderMatch = useMatch('/profile/orders/:number');
  const orderNumber = orderMatch?.params.number ?? profileOrderMatch?.params.number;
  const modalState = location.state as ModalLocationState | null;

  const handleClose = (): void => {
    if (modalState?.background) {
      void navigate(-1);
    } else {
      void navigate('/', { replace: true });
    }
  };
  return (
    <>
      <Routes location={modalState?.background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/orders" element={<ProfileOrders />} />
        </Route>

        <Route path="/feed/:number" element={<OrderInfo showNumber />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile/orders/:number" element={<OrderInfo showNumber />} />
        </Route>
        <Route
          path="/ingredients/:id"
          element={
            <div className={appStyles.detailPageWrap}>
              <h1 className={`${appStyles.detailHeader} text text_type_main-large`}>
                Детали ингредиента
              </h1>
              <IngredientDetails />
            </div>
          }
        />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {modalState?.background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={handleClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={
              <Modal
                title={
                  orderNumber
                    ? `#${orderNumber.padStart(ORDER_NUMBER_MIN_LENGTH, '0')}`
                    : `Информация о заказе`
                }
                onClose={handleClose}
              >
                <OrderInfo />
              </Modal>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/profile/orders/:number"
              element={
                <Modal
                  title={
                    orderNumber
                      ? `#${orderNumber.padStart(ORDER_NUMBER_MIN_LENGTH, '0')}`
                      : 'Информация о заказе'
                  }
                  onClose={handleClose}
                >
                  <OrderInfo />
                </Modal>
              }
            />
          </Route>
        </Routes>
      )}
    </>
  );
};

const AuthCheck = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const status = useSelector(selectUserStatus);

  if (status !== 'rejected') {
    return <Preloader />;
  }

  return (
    <div className={styles.message}>
      <p role="alert" className="text text_type_main-default mb-4">
        Не удалось проверить авторизацию. Проверьте подключение и повторите попытку.
      </p>
      <Button
        htmlType="button"
        onClick={() => {
          void dispatch(checkUser());
        }}
      >
        Повторить проверку
      </Button>
    </div>
  );
};

const GuestRoute = (): React.JSX.Element => {
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const location = useLocation();
  const state = location.state as AuthLocationState | null;

  if (!isAuthChecked) {
    return <AuthCheck />;
  }
  // prettier-ignore
  return (
    user ? <Navigate to={state?.from ?? '/'} replace /> : <Outlet />
  );
};

const ProtectedRoute = (): React.JSX.Element => {
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const location = useLocation();

  if (!isAuthChecked) {
    return <AuthCheck />;
  }
  // prettier-ignore
  return (
    user ? <Outlet /> : <Navigate to="/login" state={{ from: location } satisfies AuthLocationState} replace />
  );
};
