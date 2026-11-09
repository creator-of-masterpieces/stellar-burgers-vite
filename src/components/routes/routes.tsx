import { selectIsAuthChecked, selectUser } from '@/services/slices/user/userSelectors';
import { useSelector } from '@/services/store';
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

        <Route element={<GuestRout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/orders" element={<ProfileOrders />} />
        </Route>

        <Route path="/feed/:number" element={<OrderInfo showNumber />} />

        <Route element={<ProtectedRout />}>
          <Route path="/profile/orders/:number" element={<OrderInfo showNumber />} />
        </Route>
        <Route path="/ingredients/:id" element={<IngredientDetails />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {modalState?.background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Информация о ингредиенте" onClose={handleClose}>
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
                    ? `#${orderNumber.padStart(6, '0')}`
                    : `Информация о заказе`
                }
                onClose={handleClose}
              >
                <OrderInfo />
              </Modal>
            }
          />
          <Route element={<ProtectedRout />}>
            <Route
              path="/profile/orders/:number"
              element={
                <Modal
                  title={
                    orderNumber
                      ? `#${orderNumber.padStart(6, '0')}`
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

const GuestRout = (): React.JSX.Element => {
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const location = useLocation();
  const state = location.state as { from?: Location } | null;

  if (!isAuthChecked) return <Preloader />;
  return user ? <Navigate to={state?.from ?? '/'} replace /> : <Outlet />;
};

const ProtectedRout = (): React.JSX.Element => {
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const location = useLocation();

  if (!isAuthChecked) return <Preloader />;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};
