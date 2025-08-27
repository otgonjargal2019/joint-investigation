"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: 0,
        networkMode: "always",
      },
      queries: {
        refetchOnWindowFocus: false,
        // refetchOnReconnect: false,
        retry: 0,
      },
    },
  });
};

export default function ReactQueryProvider({ children }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
