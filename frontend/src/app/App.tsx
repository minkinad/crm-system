import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';

const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage }))
);
const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((module) => ({ default: module.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../pages/RegisterPage').then((module) => ({ default: module.RegisterPage }))
);

// Root app component with theme and route map.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d6efd'
    },
    secondary: {
      main: '#198754'
    },
    background: {
      default: '#f5f7fb'
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700
    },
    h6: {
      fontWeight: 700
    }
  }
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense
        fallback={
          <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center' }}>
            <CircularProgress aria-label="Загрузка приложения" />
          </Box>
        }
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}
