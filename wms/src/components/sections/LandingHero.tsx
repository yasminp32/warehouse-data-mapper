import React, { useRef, useEffect, useState } from 'react';
import { Power2, gsap } from 'gsap';
import ThreeScene from '@/components/3d/ThreeScene';
import { ModelLoader } from '@/components/3d/ModelLoader';
import '@/styles/components/landing-hero.css';

interface LandingHeroProps {}

const LandingHero: React.FC<LandingHeroProps> = () => {
  const [error, setError] = useState<string | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const animationTimeline = gsap.timeline({ paused: true });

    const setupAnimation = () => {
      if (!cameraRef.current) return;

      animationTimeline.to(cameraRef.current.position, {
        x: 5,
        y: 3,
        z: 8,
        duration: 5,
        ease: Power2.easeInOut,
        onUpdate: () => {
          cameraRef.current?.lookAt(0, 1.5, 0);
        },
      });

      animationTimeline.play();
    };

    if (cameraRef.current && sceneRef.current) {
      setupAnimation();
    }
  }, []);

  const handleSceneCreated = (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    sceneRef.current = scene;
    cameraRef.current = camera;
  };

  return (
    <section className="w-full h-[80vh] relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-darkGray font-roboto fade-in-down">
          Revolutionize Your Warehouse Management
        </h1>
        <p className="text-lg text-gray-500 font-open-sans mt-4 fade-in-down">
          Optimize your operations with our cutting-edge WMS, designed for efficiency and insights.
        </p>
      </div>

      <div className="w-full h-[80vh] absolute top-0 left-0">
        {error ? (
          <div className="text-red-500 font-open-sans absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            Error: {error}
          </div>
        ) : (
          <ModelLoader
            path="models/warehouse.glb"
            draco={true}
            onSceneCreated={handleSceneCreated}
            onError={(message) => setError(message)}
          >
            <ThreeScene />
          </ModelLoader>
        )}
      </div>
    </section>
  );
};

export default LandingHero;