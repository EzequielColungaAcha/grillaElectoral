import React, { createContext, useContext, useEffect } from 'react';
import { apolloClient } from '../../lib/apolloClient';
import { queryClient } from '../../lib/queryClient';

const CacheContext = createContext();

export const useCacheManager = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCacheManager must be used within a CacheProvider');
  }
  return context;
};

export const CacheProvider = ({ children }) => {
  const clearAllCaches = () => {
    // Clear Apollo Client cache
    apolloClient.clearStore();
    
    // Clear React Query cache
    queryClient.clear();
    
    // Clear localStorage cache
    localStorage.removeItem('apollo-cache');
    
    console.log('All caches cleared');
  };

  const refreshCache = async () => {
    // Refetch all active queries
    await apolloClient.refetchQueries({
      include: 'active',
    });
    
    // Invalidate all React Query caches
    queryClient.invalidateQueries();
    
    console.log('Cache refreshed');
  };

  const getCacheSize = () => {
    try {
      const apolloCacheSize = JSON.stringify(apolloClient.cache.extract()).length;
      const localStorageSize = JSON.stringify(localStorage).length;
      
      return {
        apollo: `${(apolloCacheSize / 1024).toFixed(2)} KB`,
        localStorage: `${(localStorageSize / 1024).toFixed(2)} KB`,
      };
    } catch (error) {
      console.warn('Failed to calculate cache size:', error);
      return { apollo: 'Unknown', localStorage: 'Unknown' };
    }
  };

  const value = {
    clearAllCaches,
    refreshCache,
    getCacheSize,
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};