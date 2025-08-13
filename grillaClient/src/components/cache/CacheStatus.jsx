import React, { useState, useEffect } from 'react';
import { useCacheManager } from './CacheManager';

export const CacheStatus = () => {
  const { getCacheSize, clearAllCaches, refreshCache } = useCacheManager();
  const [cacheSize, setCacheSize] = useState({ apollo: '0 KB', localStorage: '0 KB' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateCacheSize = () => {
      setCacheSize(getCacheSize());
    };

    updateCacheSize();
    const interval = setInterval(updateCacheSize, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getCacheSize]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 z-50"
        title="Show cache status"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50 min-w-64">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Cache Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
        <div>Apollo Cache: {cacheSize.apollo}</div>
        <div>Local Storage: {cacheSize.localStorage}</div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={refreshCache}
          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
        >
          Refresh
        </button>
        <button
          onClick={clearAllCaches}
          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
        >
          Clear
        </button>
      </div>
    </div>
  );
};