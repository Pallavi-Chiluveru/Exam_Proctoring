import { useEffect, useState, useCallback } from 'react';

export function useApiResource(loader, fallback, deps = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  const fetchResource = useCallback(async () => {
    let active = true;
    setLoading(true);
    try {
      const value = await loader();
      if (active) setData(value);
    } catch {
      if (active) setData(fallback);
    } finally {
      if (active) setLoading(false);
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
