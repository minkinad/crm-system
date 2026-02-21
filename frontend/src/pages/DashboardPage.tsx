import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import { apiClient } from '../api/http';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../auth/store';

// Minimal dashboard proving authenticated API access and tenant context.
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get('/health');
      return response.data as { status: string; timestamp: string };
    }
  });

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await apiClient.get('/accounts', {
        params: { page: 1, limit: 5 }
      });
      return response.data as {
        data: Array<{ id: string; name: string; industry?: string }>;
        total: number;
      };
    }
  });

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">CRM Dashboard</Typography>
          <Button
            color="inherit"
            onClick={async () => {
              await authApi.logout();
              clearSession();
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Stack spacing={2}>
          <Box>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Профиль</Typography>
              <Typography>Tenant: {user?.tenantId}</Typography>
              <Typography>User: {user?.firstName} {user?.lastName}</Typography>
              <Typography>Role: {user?.role}</Typography>
            </Paper>
          </Box>

          <Box>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">API Status</Typography>
              {healthQuery.isLoading ? <CircularProgress size={20} /> : null}
              {healthQuery.error ? <Alert severity="error">API недоступен</Alert> : null}
              {healthQuery.data ? (
                <Box>
                  <Typography>Status: {healthQuery.data.status}</Typography>
                  <Typography>Time: {healthQuery.data.timestamp}</Typography>
                </Box>
              ) : null}
            </Paper>
          </Box>

          <Box>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Accounts Snapshot</Typography>
              {accountsQuery.isLoading ? <CircularProgress size={20} /> : null}
              {accountsQuery.error ? (
                <Alert severity="warning">Нет доступа к accounts или данных пока нет.</Alert>
              ) : null}
              {accountsQuery.data?.data.map((account) => (
                <Typography key={account.id}>
                  {account.name} {account.industry ? `(${account.industry})` : ''}
                </Typography>
              ))}
            </Paper>
          </Box>
        </Stack>
      </Container>
    </>
  );
}
