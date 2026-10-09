import { Navigate, Route, Routes , Outlet} from 'react-router-dom';
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
import { Modal } from '@components/modal';
import { OrderInfo } from '@components/order-info';
import { IngredientDetails } from '@components/ingredient-details';

export const RouteComponent = (): React.JSX.Element => {
  return (
    <Routes>
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
      <Route
        path="/feed/:number"
        element={
          <Modal title="Информация о заказе" onClose={() => undefined}>
            <OrderInfo />
          </Modal>
        }
      />
      <Route
        path="/ingredients/:id"
        element={
          <Modal title="Информация о ингредиенте" onClose={() => undefined}>
            <IngredientDetails />
          </Modal>
        }
      />
      <Route element={<ProtectedRout />}>
        <Route
          path="/profile/orders/:number"
          element={
            <Modal title="Информация о заказе авторизованного пользователя" onClose={() => undefined}>
              <OrderInfo />
            </Modal>
          }
        />
      </Route>
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
};

const GuestRout = () => {
  const isAuth = false;
  if (isAuth) {
    return <Navigate to={'/'} replace />;
  }
  else {
    return <Outlet/>
  }
};

const ProtectedRout = () => {
  const isAuth = true;
  if (!isAuth) {
    return <Navigate to={'/'} />;
  } else {
    return <Outlet />;
  }
}
