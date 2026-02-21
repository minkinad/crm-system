import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/store';

// Route guard that blocks anonymous access to protected screens.
export function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
