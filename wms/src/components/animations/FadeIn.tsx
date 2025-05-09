import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from '@/utils/performanceUtils';
import '@/styles/animations/fade-in.css';

interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  duration?: string;
  easing?: string;
  ariaLabel?: string;
}

const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = '300ms',
  easing = 'ease-in-out',
  ariaLabel = "Fade-in Section",
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState(`transition-opacity duration-[${duration}] ease-[${easing}] opacity-0 font-open-sans`);

  useEffect(() => {
    const fadeInTimingId = PerformanceMonitor.startMeasuring('FadeIn Render');

    const handleAnimation = () => {
      setIsVisible(true);
      setAnimationClass(`transition-opacity duration-[${duration}] ease-[${easing}] opacity-100 font-open-sans`);
      PerformanceMonitor.stopMeasuring(fadeInTimingId);
    };

    // Check if the user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // If reduced motion is preferred, skip the animation
      setIsVisible(true);
      setAnimationClass(`opacity-100 font-open-sans`);
      PerformanceMonitor.stopMeasuring(fadeInTimingId);
    } else {
      // Otherwise, trigger the animation
      handleAnimation();
    }
   
    return () => {
     
    };
  }, [duration, easing]);

  try {
    return (
      <div
        className={animationClass}
        role="region"
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </div>
    );
  } catch (e: any) {
    console.error('Error in FadeIn component:', e);
    setError(`Error in FadeIn component: ${e.message}`);
    return (
      <div className="text-red-500 font-open-sans" aria-label={ariaLabel}>
        Error: {error}
      </div>
    );
  }
};

export default FadeIn;