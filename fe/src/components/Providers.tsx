'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
} 