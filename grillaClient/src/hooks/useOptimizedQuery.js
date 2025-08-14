import { useQuery } from '@apollo/client';
import { useQuery as useReactQuery } from '@tanstack/react-query';

// Custom hook that combines Apollo Client with React Query for better caching
export const useOptimizedQuery = (query, options = {}) => {
  const {
    variables,
    skip = false,
    pollInterval,
    fetchPolicy = 'cache-first',
    errorPolicy = 'all',
    notifyOnNetworkStatusChange = false,
    ...restOptions
  } = options;

  // Use Apollo Client for GraphQL queries with optimized caching
  const apolloResult = useQuery(query, {
    variables,
    skip,
    pollInterval,
    fetchPolicy,
    errorPolicy,
    notifyOnNetworkStatusChange,
    ...restOptions,
  });

  return apolloResult;
};

// Hook for caching non-GraphQL data
export const useCachedData = (key, fetcher, options = {}) => {
  return useReactQuery({
    queryKey: [key],
    queryFn: fetcher,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};