import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Templates } from './pages/Templates';
import { Diagnostics } from './pages/Diagnostics';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'templates', element: <Templates /> },
      { path: 'diagnostics', element: <Diagnostics /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
