import { RouterProvider } from 'react-router';
import { router } from './router';

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
