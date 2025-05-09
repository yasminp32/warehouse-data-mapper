import * as THREE from 'three@0.176.0';

interface PerformanceMetrics {
  routeTransitions: { [key: string]: { duration: number; startTime: number; endTime: number } };
  componentRenders: { [key: string]: { duration: number; startTime: number; endTime: number } };
  apiCalls: { [key: string]: { duration: number; startTime: number; endTime: number } };
  totalMemoryAllocated: number | null;
  totalJSHeapSize: number | null;
}

interface PerformanceMonitorReturn {
  startMeasuring: (id: string) => string;
  stopMeasuring: (id: string) => void;
  reportMetrics: () => PerformanceMetrics;
  startRouteTransition: () => void;
  endRouteTransition: (path: string) => void;
  startComponentRender: (componentName: string) => string;
  endComponentRender: (id: string) => void;
  startAPIcall: (apiName: string) => string;
  endAPIcall: (id: string) => void;
  getMetrics: () => PerformanceMetrics
}

const PerformanceMonitor = ((): PerformanceMonitorReturn => {
  const performanceMarkers = new Map<string, number>();
  let metrics: PerformanceMetrics = {
    routeTransitions: {},
    componentRenders: {},
    apiCalls: {},
    totalMemoryAllocated: null,
    totalJSHeapSize: null,
  };

  const isPerformanceAPIAvailable = (): boolean => {
    return typeof performance !== 'undefined' && typeof performance.now === 'function';
  };

  const isMemoryAPIAvailable = (): boolean => {
    return typeof performance !== 'undefined' && typeof performance.memory !== 'undefined';
  };

  const startMeasuring = (id: string): string => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('PerformanceMonitor: Invalid id provided to startMeasuring. It must be a non-empty string.');
      return 'unavailable';
    }

    if (!isPerformanceAPIAvailable()) {
      console.error('PerformanceMonitor: Performance API is not available in this environment.');
      return 'unavailable';
    }

    try {
      const uniqueId = crypto.randomUUID();
      performanceMarkers.set(uniqueId, performance.now());
      return uniqueId;
    } catch (e: any) {
      console.error('PerformanceMonitor: Error starting measurement:', e);
      return 'unavailable';
    }
  };

  const stopMeasuring = (id: string): void => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('PerformanceMonitor: Invalid id provided to stopMeasuring. It must be a non-empty string.');
      return;
    }

    if (!isPerformanceAPIAvailable()) {
      console.error('PerformanceMonitor: Performance API is not available in this environment.');
      return;
    }

    try {
      const startTime = performanceMarkers.get(id);

      if (typeof startTime !== 'number') {
        console.warn(`PerformanceMonitor: Performance marker with id "${id}" not found.`);
        return;
      }

      const endTime = performance.now();
      const elapsed = endTime - startTime;
      console.debug(`Performance: [${id}] took ${elapsed}ms`);
      performanceMarkers.delete(id);
    } catch (e: any) {
      console.error('PerformanceMonitor: Error stopping measurement:', e);
    }
  };

  const startRouteTransition = (): void => {
    const routeStartTime = performance.now();
    (performance as any).routeTransitionStart = routeStartTime;
  };

  const endRouteTransition = (path: string): void => {
      if (!path || typeof path !== 'string' || path.trim() === '') {
          console.error('PerformanceMonitor: Invalid path provided to endRouteTransition. It must be a non-empty string.');
          return;
      }

    const routeEndTime = performance.now();
    const routeStartTime = (performance as any).routeTransitionStart;

    if (typeof routeStartTime === 'number') {
      const duration = routeEndTime - routeStartTime;
      metrics.routeTransitions = {
        ...metrics.routeTransitions,
        [path]: {
          duration: duration,
          startTime: routeStartTime,
          endTime: routeEndTime
        }
      };
      console.debug(`PerformanceMonitor: Route transition to ${path} took ${duration}ms`);
    } else {
      console.warn('PerformanceMonitor: Route transition start time not recorded.');
    }
  };

  const startComponentRender = (componentName: string): string => {
    if (!componentName || typeof componentName !== 'string' || componentName.trim() === '') {
      console.error('PerformanceMonitor: Invalid componentName provided to startComponentRender. It must be a non-empty string.');
      return 'unavailable';
    }
    const id = startMeasuring(componentName);
    return id;
  };

  const endComponentRender = (id: string): void => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('PerformanceMonitor: Invalid id provided to endComponentRender. It must be a non-empty string.');
      return;
    }

    stopMeasuring(id);
    const startTime = performanceMarkers.get(id);
    if (typeof startTime === 'number') {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const componentName = id
      metrics.componentRenders = {
        ...metrics.componentRenders,
        [componentName]: {
          duration: duration,
          startTime: startTime,
          endTime: endTime
        }
      };
      console.debug(`PerformanceMonitor: Component ${componentName} render took ${duration}ms`);
    } else {
      console.warn(`PerformanceMonitor: Component render start time not recorded for id ${id}.`);
    }
  };

  const startAPIcall = (apiName: string): string => {
    if (!apiName || typeof apiName !== 'string' || apiName.trim() === '') {
      console.error('PerformanceMonitor: Invalid apiName provided to startAPIcall. It must be a non-empty string.');
      return 'unavailable';
    }
    const id = startMeasuring(apiName);
    return id;
  };

  const endAPIcall = (id: string): void => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('PerformanceMonitor: Invalid id provided to endAPIcall. It must be a non-empty string.');
      return;
    }
    stopMeasuring(id);
    const startTime = performanceMarkers.get(id);

    if (typeof startTime === 'number') {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const apiName = id
      metrics.apiCalls = {
        ...metrics.apiCalls,
        [apiName]: {
          duration: duration,
          startTime: startTime,
          endTime: endTime
        }
      };
      console.debug(`PerformanceMonitor: API call ${apiName} took ${duration}ms`);
    } else {
      console.warn(`PerformanceMonitor: API call start time not recorded for id ${id}.`);
    }
  };

  const getMetrics = (): PerformanceMetrics => {
      if (isMemoryAPIAvailable()) {
        metrics.totalMemoryAllocated = performance.memory?.totalJSHeapSize || null;
        metrics.totalJSHeapSize = performance.memory?.jsHeapSizeLimit || null;
      }

        return metrics;
  }

  const reportMetrics = (): PerformanceMetrics => {
    console.table(metrics.componentRenders)
    console.table(metrics.apiCalls)
    console.table(metrics.routeTransitions)
      if (isMemoryAPIAvailable()) {
          metrics.totalMemoryAllocated = performance.memory?.totalJSHeapSize || null;
          metrics.totalJSHeapSize = performance.memory?.jsHeapSizeLimit || null;
      }
      console.log(metrics)
      return metrics;
  };

  return {
    startMeasuring,
    stopMeasuring,
    reportMetrics,
    startRouteTransition,
    endRouteTransition,
    startComponentRender,
    endComponentRender,
    startAPIcall,
    endAPIcall,
    getMetrics,
  };
})();

export { PerformanceMonitor };

const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
  let timeoutId: number;

  const debouncedFunc = (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };

  return debouncedFunc as T;
};

export { debounce };