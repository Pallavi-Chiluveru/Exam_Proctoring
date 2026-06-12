import { useEffect, useState, useCallback } from 'react';

export function useApiResource(loader, fallback, deps = [], cacheKey = null) {
  const [data, setData] = useState(() => {
    if (cacheKey) {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return fallback;
  });
  
  const [loading, setLoading] = useState(!data || data === fallback);

  const fetchResource = useCallback(async () => {
    let active = true;
    try {
      const value = await loader();
      if (active) {
        setData(value);
        setLoading(false);
        if (cacheKey) sessionStorage.setItem(cacheKey, JSON.stringify(value));
      }
    } catch {
      if (active && (!data || data === fallback)) {
        setData(fallback);
        setLoading(false);
      }
    }
    return () => { active = false; };
  }, deps);

  useEffect(() => {
    const cleanup = fetchResource();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [fetchResource]);

  return { data, loading, setData, refetch: fetchResource };
}
