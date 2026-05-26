import { contract } from "@E-Commerce-Web-Application/api/index";
import { env } from "@E-Commerce-Web-Application/env/web";
import { QueryClient } from "@tanstack/react-query";
import { initClient, tsRestFetchApi } from "@ts-rest/core";
import { initTsrReactQuery } from "@ts-rest/react-query/v5";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
    },
  },
});

const clientArgs = {
  baseUrl: `${env.VITE_SERVER_URL}/rest`,
  baseHeaders: {},
  credentials: "include" as const,
  api: tsRestFetchApi,
};

const client = initClient(contract, clientArgs);

export const tsr = initTsrReactQuery(contract, clientArgs);
