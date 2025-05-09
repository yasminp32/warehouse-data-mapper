import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { PerformanceMonitor } from '@/utils/performanceUtils';

interface UseDataFetchingReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

const useDataFetching = <T>(url: string): UseDataFetchingReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<{[key: string]: {data: T, expiry: number}}>({});
  const debounceTimeout = useRef<number | null>(null);
  const isMounted = useRef<boolean>(true);
  const cacheExpiryTime = 5 * 60 * 1000; // 5 minutes
  const retryCount = useRef<number>(0);
  const maxRetries = 3;
  const initialFetch = useRef(true);

  const validateURL = (url: string): boolean => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  };

  const sanitizeURL = (url: string): string => {
    return url.replace(/[^a-zA-Z0-9/:%#\$&'\(\)\*\+,\-\.\;\=\?\@\[\]\^_\{\|\}~]+/g, '');
  };

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return;

    if (!validateURL(url)) {
      const errorMessage = 'Invalid URL provided.';
      setError(errorMessage);
      console.error(`useDataFetching: ${errorMessage} URL: ${url}`);
      return;
    }

    const sanitizedUrl = sanitizeURL(url);

    const now = new Date().getTime();
    const cachedData = cache.current[sanitizedUrl];

    if (cachedData && now < cachedData.expiry) {
      setData(cachedData.data);
      setIsLoading(false);
      setError(null);
      console.debug(`useDataFetching: Retrieved data from cache for URL: ${sanitizedUrl}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchDataAttempt = async () => {
      const fetchTimingId = PerformanceMonitor.startMeasuring(`API call to ${sanitizedUrl}`);
      try {
        const response: AxiosResponse<T> = await axios.get<T>(sanitizedUrl);

        PerformanceMonitor.stopMeasuring(fetchTimingId);
        console.debug(`useDataFetching: Successfully fetched data from URL: ${sanitizedUrl}`);

        if (isMounted.current) {
          setData(response.data);
          cache.current[sanitizedUrl] = {data: response.data, expiry: new Date().getTime() + cacheExpiryTime};
          retryCount.current = 0;
        }
      } catch (e: any) {
        const axiosError = e as AxiosError;
        let errorMessage = `Failed to fetch data from URL: ${sanitizedUrl}`;

        if (axiosError.response) {
          errorMessage += `. Status Code: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}`;
        } else if (axiosError.request) {
          errorMessage += '. No response received from the server.';
        } else {
          errorMessage += `. Error message: ${axiosError.message}`;
        }

        console.error('useDataFetching: ' + errorMessage);
        PerformanceMonitor.stopMeasuring(fetchTimingId);

        if (isMounted.current) {
          setError(errorMessage);
          setData(null);

          if (retryCount.current < maxRetries) {
            retryCount.current++;
            console.log(`useDataFetching: Retrying fetch. Attempt: ${retryCount.current}`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount.current) * 1000));
            return fetchDataAttempt();
          } else {
            console.error('useDataFetching: Max retries reached. Giving up.');
            PerformanceMonitor.stopMeasuring(fetchTimingId);
          }
        }
      } finally {
        if (isMounted.current) {
           setIsLoading(false);
        }
      }
    };

    await fetchDataAttempt();
  }, [url]);

  useEffect(() => {
    if (initialFetch.current) {
       const throttledFetchData = () => {
          if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
          }
          debounceTimeout.current = setTimeout(() => {
             fetchData();
          }, 200);
       }
      throttledFetchData();
      initialFetch.current = false;
    }

    return () => {
      isMounted.current = false;
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [fetchData]);

  return { data, isLoading, error, fetchData };
};

export default useDataFetching;