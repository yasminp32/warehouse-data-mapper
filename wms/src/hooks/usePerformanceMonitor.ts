import { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';

interface UsePerformanceMonitorReturn {
  fps: number | null;
  memoryUsage: number | null;
  startMeasuring: (id: string) => string;
  stopMeasuring: (id: string) => void;
}

const usePerformanceMonitor = (): UsePerformanceMonitorReturn => {
  const [fps, setFps] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const performanceMarkers = useRef<Map<string, number>>(new Map());

  const startMeasuring = useCallback((id: string): string => {
    try {
      if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
        setError('Performance API is not available in this environment.');
        console.error('usePerformanceMonitor: Performance API is not available.');
        return 'unavailable';
      }
      const uniqueId = crypto.randomUUID();
      performanceMarkers.current.set(uniqueId, performance.now());
      return uniqueId;
    } catch (e: any) {
      console.error('usePerformanceMonitor: Error starting measurement:', e);
      setError(`usePerformanceMonitor: Error starting measurement: ${e.message}`);
      return 'unavailable';
    }
  }, []);

  const stopMeasuring = useCallback((id: string): void => {
    try {
      if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
        setError('Performance API is not available in this environment.');
        console.error('usePerformanceMonitor: Performance API is not available.');
        return;
      }

      const startTime = performanceMarkers.current.get(id);

      if (typeof startTime !== 'number') {
        console.warn(`usePerformanceMonitor: Performance marker with id "${id}" not found.`);
        return;
      }

      const endTime = performance.now();
      const elapsed = endTime - startTime;
      console.debug(`Performance: [${id}] took ${elapsed}ms`);
      performanceMarkers.current.delete(id);
    } catch (e: any) {
      console.error('usePerformanceMonitor: Error stopping measurement:', e);
      setError(`usePerformanceMonitor: Error stopping measurement: ${e.message}`);
    }
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const updateFps = () => {
      if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
        setError('Performance API is not available in this environment.');
        console.error('usePerformanceMonitor: Performance API is not available.');
        return;
      }
      const now = performance.now();
      const timeDiff = now - lastTime;
      if (timeDiff > 100) {
        const calculatedFps = Math.round(frameCount / (timeDiff / 1000));
        setFps(calculatedFps);
        frameCount = 0;
        lastTime = now;
      }
      frameCount++;
      animationFrameId = requestAnimationFrame(updateFps);
    };

    if (typeof requestAnimationFrame === 'undefined') {
      setError('requestAnimationFrame is not available in this environment.');
      console.error('usePerformanceMonitor: requestAnimationFrame is not available.');
      return;
    }

    animationFrameId = requestAnimationFrame(updateFps);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const updateMemoryUsage = () => {
      if (typeof performance === 'undefined' || typeof performance.memory === 'undefined') {
        console.warn('usePerformanceMonitor: performance.memory is not available in this environment.');
        return;
      }
      setMemoryUsage(performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit);
    };

    const memoryCheckInterval = setInterval(updateMemoryUsage, 10000);

    return () => {
      clearInterval(memoryCheckInterval);
    };
  }, []);

  useEffect(() => {
    return () => {
      performanceMarkers.current.clear();
    };
  }, []);

  return {
    fps,
    memoryUsage,
    startMeasuring,
    stopMeasuring,
  };
};

export default usePerformanceMonitor;