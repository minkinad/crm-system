import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../auth/store';

// Tenant-aware login form that starts authenticated session.
export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [tenantSlug, setTenantSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.login({ tenantSlug, email, password }),
    onSuccess: ({ data }) => {
      setSession(data);
      navigate('/dashboard');
    }
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">CRM Login</Typography>
          <Typography color="text.secondary">
            Введите tenant slug и учётные данные.
          </Typography>
          {mutation.isError ? (
            <Alert severity="error">Неверные данные или tenant недоступен.</Alert>
          ) : null}
          <TextField
            label="Tenant Slug"
            value={tenantSlug}
            onChange={(event) => setTenantSlug(event.target.value)}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button
            variant="contained"
            size="large"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            Войти
          </Button>
          <Box>
            <Typography variant="body2">
              Нет аккаунта? <Link to="/register">Зарегистрировать tenant</Link>
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
