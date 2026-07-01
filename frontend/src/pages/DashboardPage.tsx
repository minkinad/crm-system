import { ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BusinessIcon from '@mui/icons-material/Business';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { apiClient } from '../api/http';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../auth/store';

interface CurrencyValue {
  currency: string;
  value: number;
}

interface StageSummary {
  stage: string;
  probability: number;
  count: number;
  valueByCurrency: CurrencyValue[];
}

interface ForecastTotal {
  currency: string;
  pipeline: number;
  weighted: number;
}

interface NextAction {
  id: string;
  title: string;
  stage: string;
  value: number;
  currency: string;
  expectedCloseDate?: string | null;
  priorityScore: number;
  reasons: string[];
}

interface DealInsights {
  generatedAt: string;
  stageSummary: StageSummary[];
  forecastByCurrency: ForecastTotal[];
  riskCounters: {
    staleDeals: number;
    overdueCloseDates: number;
    dealsWithoutOpenTask: number;
  };
  nextActions: NextAction[];
}

interface Account {
  id: string;
  name: string;
  industry?: string | null;
}

interface Task {
  id: string;
  title: string;
  dueDate?: string | null;
  status: string;
  priority: string;
}

interface Paginated<T> {
  data: T[];
  total: number;
}

const panelSx = {
  p: 2.5,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none'
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function formatCurrencyList(values: CurrencyValue[]) {
  if (values.length === 0) {
    return '0';
  }

  return values.map((item) => formatCurrency(item.value, item.currency)).join(' / ');
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Без даты';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const insightsQuery = useQuery({
    queryKey: ['deal-insights'],
    queryFn: async () => {
      const response = await apiClient.get<DealInsights>('/deals/analytics/summary');
      return response.data;
    }
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<Paginated<Task>>('/tasks', {
        params: { page: 1, limit: 6 }
      });
      return response.data;
    }
  });

  const accountsQuery = useQuery({
    queryKey: ['accounts', 'dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<Paginated<Account>>('/accounts', {
        params: { page: 1, limit: 5 }
      });
      return response.data;
    }
  });

  const isLoading = insightsQuery.isLoading || tasksQuery.isLoading || accountsQuery.isLoading;
  const hasError = insightsQuery.isError || tasksQuery.isError || accountsQuery.isError;

  const primaryForecast = insightsQuery.data?.forecastByCurrency[0];
  const totalRisk = insightsQuery.data
    ? insightsQuery.data.riskCounters.staleDeals +
      insightsQuery.data.riskCounters.overdueCloseDates +
      insightsQuery.data.riskCounters.dealsWithoutOpenTask
    : 0;

  const maxStageValue = useMemo(() => {
    const values =
      insightsQuery.data?.stageSummary.map((stage) =>
        stage.valueByCurrency.reduce((sum, item) => sum + item.value, 0)
      ) ?? [];
    return Math.max(...values, 1);
  }, [insightsQuery.data?.stageSummary]);

  const refreshAll = () => {
    void insightsQuery.refetch();
    void tasksQuery.refetch();
    void accountsQuery.refetch();
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <AccountTreeIcon color="primary" />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              Sales Cockpit
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.firstName} {user?.lastName} · {user?.role} · Tenant {user?.tenantId}
            </Typography>
          </Box>
          <Tooltip title="Обновить данные">
            <IconButton onClick={refreshAll} aria-label="Обновить данные">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={async () => {
              await authApi.logout();
              clearSession();
              window.location.href = '/login';
            }}
          >
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2.5}>
          {hasError ? (
            <Alert severity="warning">
              Часть данных недоступна. Проверьте backend, tenant context и права пользователя.
            </Alert>
          ) : null}

          {isLoading ? (
            <Paper sx={panelSx}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CircularProgress size={20} />
                <Typography>Загружаю операционную картину продаж...</Typography>
              </Stack>
            </Paper>
          ) : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2
            }}
          >
            <MetricPanel
              icon={<TrendingUpIcon color="success" />}
              label="Weighted forecast"
              value={
                primaryForecast
                  ? formatCurrency(primaryForecast.weighted, primaryForecast.currency)
                  : '0'
              }
              helper={
                primaryForecast
                  ? `Pipeline ${formatCurrency(primaryForecast.pipeline, primaryForecast.currency)}`
                  : 'Нет открытой выручки'
              }
            />
            <MetricPanel
              icon={<WarningAmberIcon color={totalRisk > 0 ? 'warning' : 'disabled'} />}
              label="Sales risks"
              value={String(totalRisk)}
              helper="Просрочки, stale deals и сделки без follow-up"
            />
            <MetricPanel
              icon={<AssignmentTurnedInIcon color="primary" />}
              label="Tasks"
              value={String(tasksQuery.data?.total ?? 0)}
              helper="Последние активности команды"
            />
            <MetricPanel
              icon={<BusinessIcon color="secondary" />}
              label="Accounts"
              value={String(accountsQuery.data?.total ?? 0)}
              helper="Активная клиентская база"
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' },
              gap: 2
            }}
          >
            <Paper sx={panelSx}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6">Воронка и прогноз</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Прогноз считается по вероятности стадии и текущей сумме сделок.
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  {insightsQuery.data?.stageSummary.map((stage) => {
                    const stageValue = stage.valueByCurrency.reduce(
                      (sum, item) => sum + item.value,
                      0
                    );
                    return (
                      <Box key={stage.stage}>
                        <Stack direction="row" justifyContent="space-between" gap={2}>
                          <Typography fontWeight={700}>{stage.stage}</Typography>
                          <Typography color="text.secondary">
                            {stage.count} · {formatCurrencyList(stage.valueByCurrency)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <LinearProgress
                            variant="determinate"
                            value={(stageValue / maxStageValue) * 100}
                            sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                          />
                          <Chip
                            size="small"
                            label={`${Math.round(stage.probability * 100)}%`}
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
            </Paper>

            <Paper sx={panelSx}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6">Next actions</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Приоритетные сделки, где нужен контроль менеджера.
                  </Typography>
                </Box>
                <Stack spacing={1.25}>
                  {insightsQuery.data?.nextActions.length ? (
                    insightsQuery.data.nextActions.map((action) => (
                      <Box
                        key={action.id}
                        sx={{
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" gap={2}>
                            <Typography fontWeight={700}>{action.title}</Typography>
                            <Typography color="text.secondary" whiteSpace="nowrap">
                              {formatCurrency(action.value, action.currency)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={action.stage} />
                            <Chip
                              size="small"
                              icon={<EventBusyIcon />}
                              label={formatDate(action.expectedCloseDate)}
                              variant="outlined"
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {action.reasons.join(' · ')}
                          </Typography>
                        </Stack>
                      </Box>
                    ))
                  ) : (
                    <Alert severity="success">Критичных действий по сделкам сейчас нет.</Alert>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: 2
            }}
          >
            <Paper sx={panelSx}>
              <Typography variant="h6">Задачи</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Приоритет</TableCell>
                    <TableCell>Срок</TableCell>
                    <TableCell>Статус</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasksQuery.data?.data.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell>{task.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Paper sx={panelSx}>
              <Typography variant="h6">Accounts snapshot</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1}>
                {accountsQuery.data?.data.length ? (
                  accountsQuery.data.data.map((account) => (
                    <Stack
                      key={account.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}
                    >
                      <Typography fontWeight={700}>{account.name}</Typography>
                      <Typography color="text.secondary">{account.industry ?? 'Без отрасли'}</Typography>
                    </Stack>
                  ))
                ) : (
                  <Typography color="text.secondary">Компании пока не заведены.</Typography>
                )}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </>
  );
}

function MetricPanel({
  icon,
  label,
  value,
  helper
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Paper sx={panelSx}>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {icon}
        </Stack>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      </Stack>
    </Paper>
  );
}
