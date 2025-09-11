import { useState, useEffect, useCallback, useRef } from 'react';
import { getClothes, patchCloth, bulkUpdateClothes } from '../api';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useClothesCache = (filters = {}) => {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);
  const [pagination, setPagination] = useState(null);
  
  const cacheKey = useRef(JSON.stringify(filters));
  const abortController = useRef(null);

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    return Date.now() - lastFetch < CACHE_DURATION && 
           JSON.stringify(filters) === cacheKey.current;
  }, [lastFetch, filters]);

  // Fetch clothes with caching
  const fetchClothes = useCallback(async (forceRefresh = false) => {
    // Try sessionStorage cache first
    const storageKey = `clothes:${cacheKey.current}`;
    if (!forceRefresh) {
      const cached = sessionStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Validate age
          if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            setClothes(parsed.data || []);
            setPagination(parsed.pagination || null);
            setLastFetch(parsed.timestamp);
            setLoading(false);
            return;
          }
        } catch {}
      }
    }

    // Use in-memory cache if valid and not forcing refresh
    if (!forceRefresh && isCacheValid() && clothes.length > 0) {
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await getClothes(filters);
      const data = response.data || [];
      const paginationData = response.pagination || null;
      setClothes(data);
      setPagination(paginationData);
      setLastFetch(Date.now());
      cacheKey.current = JSON.stringify(filters);
      // Persist to sessionStorage
      sessionStorage.setItem(storageKey, JSON.stringify({
        data,
        pagination: paginationData,
        timestamp: Date.now()
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('Failed to fetch clothes:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, isCacheValid, clothes.length]);

  // Update single cloth item in cache
  const updateClothInCache = useCallback((id, updates) => {
    setClothes(prev => prev.map(cloth => 
      cloth._id === id ? { ...cloth, ...updates } : cloth
    ));
  }, []);

  // Update multiple cloth items in cache
  const updateClothesInCache = useCallback((updates) => {
    setClothes(prev => {
      const updated = [...prev];
      updates.forEach(update => {
        const index = updated.findIndex(cloth => cloth._id === update.id);
        if (index !== -1) {
          updated[index] = { ...updated[index], ...update };
        }
      });
      return updated;
    });
  }, []);

  // PATCH single cloth (minimal update)
  const patchClothItem = useCallback(async (id, updates) => {
    try {
      const response = await patchCloth(id, updates);
      updateClothInCache(id, response.data);
      return response;
    } catch (error) {
      console.error('Failed to patch cloth:', error);
      throw error;
    }
  }, [updateClothInCache]);

  // Bulk update multiple clothes
  const bulkUpdateClothItems = useCallback(async (updates) => {
    try {
      const response = await bulkUpdateClothes(updates);
      updateClothesInCache(updates);
      return response;
    } catch (error) {
      console.error('Failed to bulk update clothes:', error);
      throw error;
    }
  }, [updateClothesInCache]);

  // Toggle worn status for multiple items
  const toggleWornStatus = useCallback(async (itemIds, worn) => {
    const updates = itemIds.map(id => ({ id, worn }));
    return bulkUpdateClothItems(updates);
  }, [bulkUpdateClothItems]);

  // Toggle cleaning status for multiple items
  const toggleCleaningStatus = useCallback(async (itemIds, needsCleaning) => {
    const updates = itemIds.map(id => ({ id, needsCleaning }));
    return bulkUpdateClothItems(updates);
  }, [bulkUpdateClothItems]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchClothes(true);
  }, [fetchClothes]);

  // Initial fetch
  useEffect(() => {
    fetchClothes();
    
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchClothes]);

  // Clear cache when filters change
  useEffect(() => {
    if (JSON.stringify(filters) !== cacheKey.current) {
      setClothes([]);
      setLastFetch(0);
    }
  }, [filters]);

  return {
    clothes,
    loading,
    error,
    pagination,
    refresh,
    patchClothItem,
    bulkUpdateClothItems,
    toggleWornStatus,
    toggleCleaningStatus,
    updateClothInCache,
    updateClothesInCache,
    isCacheValid: isCacheValid()
  };
};

export default useClothesCache;
