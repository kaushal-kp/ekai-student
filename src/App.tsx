import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from '@/router';
import { useAuthStore } from '@/store/authStore';
import { mockStudent } from '@/mocks/data/student';
import { PageLoader } from '@/components/shared/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInner() {
  const { setAuth, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const persisted = localStorage.getItem('ekai_demo_auth');
        if (persisted) {
          const parsed = JSON.parse(persisted);
          setAuth(parsed.student || mockStudent, parsed.token || 'mock-token', parsed.sessionId || 'session-001');
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  if (isLoading) return <PageLoader />;

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
