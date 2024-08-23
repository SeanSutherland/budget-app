import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const CreateTransactionPage = lazy(() => import('src/pages/create-transaction'));
export const CreateBulkTransactionPage = lazy(() => import('src/pages/create-bulk-transaction'));
export const EditTransactionPage = lazy(() => import('src/pages/edit-transaction'));
export const BudgetPage = lazy(() => import('src/pages/budget'));
export const CreateContributionPage = lazy(() => import('src/pages/create-contribution'));
export const PasswordResetPage = lazy(() => import('src/pages/password-reset'));
export const ForgotPasswordPage = lazy(() => import('src/pages/forgot-password'));
export const SplitsPage = lazy(() => import('src/pages/splits'));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <IndexPage />, index: true },
        { path: 'transactions', element: <UserPage /> },
        { path: 'savings', element: <BlogPage /> },
        {
          path: 'transactions/create',
          element: <CreateTransactionPage />,
        },
        {
          path: 'transactions/create-bulk',
          element: <CreateBulkTransactionPage />,
        },
        {
          path: 'transaction/edit/:id',
          element: <EditTransactionPage/>,
        },
        {
          path: 'budget/:id',
          element: <BudgetPage/>,
        },
        {
          path: 'savings/contribute',
          element: <CreateContributionPage/>,
        },
        {
          path: 'splits',
          element: <SplitsPage/>,
        },
      ],
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'reset-password',
      element: <PasswordResetPage />,
    },
    {
      path: 'forgot-password',
      element: <ForgotPasswordPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}