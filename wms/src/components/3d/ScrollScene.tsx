import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { Power2, gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import '@/styles/components/scroll-scene.css';
import FadeIn from '@/components/animations/FadeIn';

gsap.registerPlugin(ScrollTrigger);

interface ScrollSceneProps {
  children: React.ReactNode;
}

const ScrollScene: React.FC<ScrollSceneProps> = React.memo(({ children }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { scrollYProgress } = useScrollAnimation();
  const { scene, camera } = useThree();

  useEffect(() => {
    if (!scene) {
      setError("Scene not initialized");
      console.error("Scene not initialized");
      return;
    }
    if (!camera) {
      setError("Camera not initialized");
      console.error("Camera not initialized");
      return;
    }

    const animationTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        scroller: ".smooth-scroll-wrapper",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        markers: false,
        onUpdate: () => {
          try {
            if (!camera) {
              throw new Error("Camera not initialized");
            }

          } catch (e: any) {
            console.error("Error in animation frame:", e);
            setError(`Error in animation frame: ${e.message}`);
          }
        },
      },
    });

    try {
      if (!(camera instanceof THREE.PerspectiveCamera)) {
        throw new Error("Camera is not a PerspectiveCamera");
      }

      animationTimeline.to(camera.position, {
        z: 15,
        duration: 1,
        ease: Power2.easeInOut,
      }, 0);

      animationTimeline.to(camera.rotation, {
        x: Math.PI / 2,
        duration: 1,
        ease: Power2.easeInOut
      }, 0);
    } catch (e: any) {
      console.error("Error setting up scroll animations:", e);
      setError(`Error setting up scroll animations: ${e.message}`);
    }

    return () => {
      animationTimeline.kill();
    };
  }, [scene, camera]);

  useFrame(() => {
    if (meshRef.current) {
    }
  });

  return (
    <section className="scroll-section h-[200vh]" ref={sectionRef}>
      <FadeIn>
        <group ref={meshRef} >
          {children}
        </group>
      </FadeIn>
      {error && (
        <div className="error-message">
          {`Error: ${error}`}
        </div>
      )}
    </section>
  );
}, (prevProps, nextProps) => {
  return prevProps.children === nextProps.children;
});

export default ScrollScene;