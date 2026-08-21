import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { refreshSession } from '../api/http';
import { useAuthStore } from '../auth/store';

// Route guard that blocks anonymous access to protected screens.
export function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (!accessToken && status === 'idle') {
      void refreshSession().catch(() => undefined);
    }
  }, [accessToken, status]);

  if (status === 'idle' || status === 'loading') {
    return (
      <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center' }}>
        <CircularProgress aria-label="Восстановление сессии" />
      </Box>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
