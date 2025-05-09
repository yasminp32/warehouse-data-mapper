import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from '@/utils/performanceUtils';
import '@/styles/animations/slide-in.css';

interface SlideInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  duration?: string;
  easing?: string;
  ariaLabel?: string;
}

const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  duration = '300ms',
  easing = 'ease-in-out',
  ariaLabel = "Slide-in Section",
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInitialTranslate = () => {
    switch (direction) {
      case 'left':
        return 'translate-x-[-100%]';
      case 'right':
        return 'translate-x-[100%]';
      case 'top':
        return 'translate-y-[-100%]';
      case 'bottom':
        return 'translate-y-[100%]';
      default:
        return 'translate-x-[-100%]';
    }
  };

  const getFinalTranslate = () => {
    switch (direction) {
      case 'left':
        return 'translate-x-[0%]';
      case 'right':
        return 'translate-x-[0%]';
      case 'top':
        return 'translate-y-[0%]';
      case 'bottom':
        return 'translate-y-[0%]';
      default:
        return 'translate-x-[0%]';
    }
  };

  const [animationClass, setAnimationClass] = useState(`transition-transform duration-[${duration}] ease-[${easing}] ${getInitialTranslate()} opacity-0 font-open-sans`);

  useEffect(() => {
    const slideInTimingId = PerformanceMonitor.startMeasuring('SlideIn Render');

    const handleAnimation = () => {
      setIsVisible(true);
      setAnimationClass(`transition-transform duration-[${duration}] ease-[${easing}] ${getFinalTranslate()} opacity-100 font-open-sans`);
      PerformanceMonitor.stopMeasuring(slideInTimingId);
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      setAnimationClass(`opacity-100 font-open-sans`);
      PerformanceMonitor.stopMeasuring(slideInTimingId);
    } else {
      handleAnimation();
    }

    return () => {
    };
  }, [duration, easing, direction]);

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
    console.error('Error in SlideIn component:', e);
    setError(`Error in SlideIn component: ${e.message}`);
    return (
      <div className="text-red-500 font-open-sans" aria-label={ariaLabel}>
        Error: {error}
      </div>
    );
  }
};

export default SlideIn;