import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { LoadingOverlay } from './ui/Spinner';

export const ProtectedRoute = () => {
  const { isAuthenticated, isHydrated, checkAuth } = useAuthStore();

  useEffect(() => {
    if (isHydrated) {
      checkAuth();
    }
  }, [isHydrated, checkAuth]);

  if (!isHydrated) {
    return <LoadingOverlay />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
