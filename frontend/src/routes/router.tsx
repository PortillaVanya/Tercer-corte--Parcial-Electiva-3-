import { createBrowserRouter } from 'react-router';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { LandingPage } from '../pages/LandingPage';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { LogsPage } from '../pages/LogsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PredictionsPage } from '../pages/PredictionsPage';
import { ProveedoresPage } from '../pages/ProveedoresPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/products',
            element: <ProductsPage />,
          },
          {
            path: '/categories',
            element: <CategoriesPage />,
          },
          {
            path: '/history',
            element: <LogsPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/predictions',
            element: <PredictionsPage />,
          },
          {
            path: '/suppliers',
            element: <ProveedoresPage />,
          },
        ],
      },
    ],
  },
]);
