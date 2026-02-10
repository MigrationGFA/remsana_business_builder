import { useState, useCallback } from 'react';

export function useRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): [() => Promise<T>, boolean, Error | null] {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (): Promise<T> => {
    setLoading(true);
    setError(null);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        setLoading(false);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
        }
      }
    }

    setLoading(false);
    setError(lastError);
    throw lastError;
  }, [fn, maxRetries, delay]);

  return [execute, loading, error];
}
