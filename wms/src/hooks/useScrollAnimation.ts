import { useState, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { debounce } from '@/utils/performanceUtils';
import '@/styles/components/scroll-scene.css';

/**
 * @description A custom React hook that provides scroll-based animation values.
 * @returns An object containing scrollYProgress, scrollXProgress, scrollY, and scrollX.
 */
interface UseScrollAnimationReturn {
  scrollYProgress: number;
  scrollXProgress: number;
  scrollY: number;
  scrollX: number;
}

const useScrollAnimation = (): UseScrollAnimationReturn => {
  const [scrollData, setScrollData] = useState<UseScrollAnimationReturn>({
    scrollYProgress: 0,
    scrollXProgress: 0,
    scrollY: 0,
    scrollX: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const updateScrollData = useCallback(() => {
    try {
      // Attempt to read DOM properties, handling potential errors.
      const scrollY = Number(window.scrollY);
      const scrollX = Number(window.scrollX);
      const scrollHeight = Number(document.documentElement?.scrollHeight || 0);
      const scrollWidth = Number(document.documentElement?.scrollWidth || 0);
      const clientHeight = Number(document.documentElement?.clientHeight || window.innerHeight || 0);
      const clientWidth = Number(document.documentElement?.clientWidth || window.innerWidth || 0);

      // Ensure scrollHeight and scrollWidth are not zero to avoid division by zero.
      const scrollYProgress = scrollHeight > clientHeight
        ? Number(scrollY / (scrollHeight - clientHeight))
        : 0;
      const scrollXProgress = scrollWidth > clientWidth
        ? Number(scrollX / (scrollWidth - clientWidth))
        : 0;

      // Update the state with the calculated values.
      setScrollData({
        scrollYProgress: scrollYProgress,
        scrollXProgress: scrollXProgress,
        scrollY: scrollY,
        scrollX: scrollX,
      });
    } catch (e: any) {
      // Log the error and set an error state.
      console.error('useScrollAnimation: Error reading scroll data:', e);
      setError(`useScrollAnimation: Error reading scroll data: ${e.message}`);

      // Return a default state with error flags.
      setScrollData({
        scrollYProgress: Number(-1),
        scrollXProgress: Number(-1),
        scrollY: Number(-1),
        scrollX: Number(-1),
      });
    }
  }, []);

  useEffect(() => {
    // Initial update of scroll data.
    updateScrollData();

    // Debounced scroll event listener.
    const debouncedUpdateScrollData = debounce(updateScrollData, 50);

    // Attach the scroll event listener to the window.
    window.addEventListener('scroll', debouncedUpdateScrollData);

    // Cleanup function to remove the event listener.
    return () => {
      window.removeEventListener('scroll', debouncedUpdateScrollData);
    };
  }, [updateScrollData]);

  return scrollData;
};

export default useScrollAnimation;