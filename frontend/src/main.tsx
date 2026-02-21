import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './app/App';

// Frontend bootstrap with global providers.
const queryClient = new QueryClient();
const RouterComponent =
  import.meta.env.VITE_ROUTER_MODE === 'hash' ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterComponent>
        <App />
      </RouterComponent>
    </QueryClientProvider>
  </React.StrictMode>
);
