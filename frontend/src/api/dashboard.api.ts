import { apiClient } from './http';

export interface CurrencyValue {
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

export const dashboardApi = {
  async getDealInsights(): Promise<DealInsights> {
    const response = await apiClient.get<DealInsights>('/deals/analytics/summary');
    return response.data;
  },

  async getTasks(): Promise<Paginated<Task>> {
    const response = await apiClient.get<Paginated<Task>>('/tasks', {
      params: { page: 1, limit: 6 }
    });
    return response.data;
  },

  async getAccounts(): Promise<Paginated<Account>> {
    const response = await apiClient.get<Paginated<Account>>('/accounts', {
      params: { page: 1, limit: 5 }
    });
    return response.data;
  }
};
