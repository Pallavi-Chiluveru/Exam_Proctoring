import { useEffect, useState } from 'react';

export function useApiResource(loader, fallback, deps = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loader()
      .then((value) => active && setData(value))
      .catch(() => active && setData(fallback))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, deps);

  return { data, loading, setData };
}
