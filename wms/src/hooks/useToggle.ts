import { useState, useCallback, useEffect } from 'react';

/**
 * @version 0.1.0
 * @description A custom React hook for managing a boolean toggle state.
 * @returns An object containing the toggle state and a function to toggle it.
 *
 * Testing Considerations:
 * - Unit tests can be created to test state initialization (expect(isOn).toBe(false)),
 *   state toggling (expect(toggle()).toBe(!isOn)), and error handling (expect(error).not.toBeNull).
 */
interface UseToggleReturn {
  isOn: boolean;
  toggle: () => void;
  error: string | null;
}

const useToggle = (initialState: boolean = false): UseToggleReturn => {
  const [isOn, setIsOn] = useState<boolean>(initialState);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(() => {
    try {
      setIsOn(prevIsOn => !prevIsOn);
    } catch (e: any) {
      console.error('useToggle: Error toggling state:', e);
      setError(`useToggle: Error toggling state: ${e.message}`);
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.warn('useToggle: Animations are disabled due to user preference.');
    }
  }, []);

  return {
    isOn: error ? false : isOn,
    toggle,
    error,
  };
};

export default useToggle;