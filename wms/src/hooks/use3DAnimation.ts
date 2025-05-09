import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { PerformanceMonitor } from '@/utils/performanceUtils';

/**
 * @description A custom React hook for managing and controlling 3D animations within a Three.js scene.
 * @param scene - The Three.js scene object.
 * @param model - The Three.js object to animate.
 * @param animationConfig - An object defining the animation properties, target values, durations, and easing functions.
 * @returns An object containing animation control methods (play, pause, reverse, seek) and the timeline reference.
 */
interface Use3DAnimationReturn {
  play: () => void;
  pause: () => void;
  reverse: () => void;
  seek: (time: number) => void;
  timeline: React.MutableRefObject<gsap.core.Timeline | null>;
}

const use3DAnimation = (
  scene: THREE.Scene | undefined,
  model: THREE.Object3D | undefined,
  animationConfig: { [key: string]: { property: string; to: any; duration: number; ease: string } } | undefined
): Use3DAnimationReturn => {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scene) {
      setError('Scene is not initialized.');
      console.error('use3DAnimation: Scene is not initialized.');
      return;
    }

    if (!model) {
      setError('Model is not initialized.');
      console.error('use3DAnimation: Model is not initialized.');
      return;
    }

    if (!animationConfig) {
      setError('Animation config is not defined.');
      console.error('use3DAnimation: Animation config is not defined.');
      return;
    }

    const animationTimingId = PerformanceMonitor.startMeasuring('3D Animation Setup');

    try {
      timelineRef.current = gsap.timeline();

      for (const key in animationConfig) {
        if (animationConfig.hasOwnProperty(key)) {
          const config = animationConfig[key];
          const target = model.getObjectByName(key);

          if (!target) {
            console.warn(`use3DAnimation: Target object with name ${key} not found in the model.`);
            continue;
          }

          if (!config.property || typeof config.property !== 'string') {
            console.warn(`use3DAnimation: Property for target ${key} is invalid.`);
            continue;
          }

          if (typeof config.duration !== 'number' || config.duration <= 0) {
            console.warn(`use3DAnimation: Duration for target ${key} is invalid.`);
            continue;
          }

          if (typeof config.ease !== 'string' || config.ease.trim() === '') {
            console.warn(`use3DAnimation: Easing function for target ${key} is invalid.`);
            continue;
          }

          timelineRef.current.to(target[config.property], {
            to: config.to,
            duration: config.duration,
            ease: config.ease,
          });
        }
      }
    } catch (e: any) {
      console.error('use3DAnimation: Error setting up animation timeline:', e);
      setError(`use3DAnimation: Error setting up animation timeline: ${e.message}`);
      PerformanceMonitor.stopMeasuring(animationTimingId);
      return;
    } finally {
      PerformanceMonitor.stopMeasuring(animationTimingId);
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [scene, model, animationConfig]);

  const play = useCallback(() => {
    if (timelineRef.current) {
      try {
        timelineRef.current.play();
        setIsPlaying(true);
      } catch (e: any) {
        console.error('use3DAnimation: Error playing animation:', e);
        setError(`use3DAnimation: Error playing animation: ${e.message}`);
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (timelineRef.current) {
      try {
        timelineRef.current.pause();
        setIsPlaying(false);
      } catch (e: any) {
        console.error('use3DAnimation: Error pausing animation:', e);
        setError(`use3DAnimation: Error pausing animation: ${e.message}`);
      }
    }
  }, []);

  const reverse = useCallback(() => {
    if (timelineRef.current) {
      try {
        timelineRef.current.reverse();
        setIsPlaying(false);
      } catch (e: any) {
        console.error('use3DAnimation: Error reversing animation:', e);
        setError(`use3DAnimation: Error reversing animation: ${e.message}`);
      }
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (timelineRef.current) {
      try {
        timelineRef.current.seek(time);
      } catch (e: any) {
        console.error('use3DAnimation: Error seeking animation:', e);
        setError(`use3DAnimation: Error seeking animation: ${e.message}`);
      }
    }
  }, []);

  return {
    play,
    pause,
    reverse,
    seek,
    timeline: timelineRef,
  };
};

export default use3DAnimation;