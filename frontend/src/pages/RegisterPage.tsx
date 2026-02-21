import { useMutation } from '@tanstack/react-query';
import {
  Alert,
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

// Tenant onboarding page creating first admin account.
export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      authApi.register({
        tenantName,
        tenantSlug,
        firstName,
        lastName,
        email,
        password
      }),
    onSuccess: ({ data }) => {
      setSession(data);
      navigate('/dashboard');
    }
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Create CRM Workspace</Typography>
          {mutation.isError ? (
            <Alert severity="error">Не удалось создать tenant.</Alert>
          ) : null}
          <TextField label="Tenant Name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
          <TextField label="Tenant Slug" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} required />
          <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button variant="contained" size="large" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Создать workspace
          </Button>
          <Typography variant="body2">
            Уже зарегистрированы? <Link to="/login">Войти</Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
