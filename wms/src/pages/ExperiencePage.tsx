import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as THREE from 'three';
import { Power2, gsap } from 'gsap';

import ThreeScene from '@/components/3d/ThreeScene';
import ScrollScene from '@/components/3d/ScrollScene';
import AdvancedScene from '@/components/3d/AdvancedScene';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { use3DInteraction } from '@/hooks/use3DInteraction';
import FadeIn from '@/components/animations/FadeIn';
import '@/styles/pages/experience.css';
import { PerformanceMonitor } from '@/utils/performanceUtils';

const ExperiencePage: React.FC = React.memo(() => {
  const sectionRef = useRef<HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedObjectName, setSelectedObjectName] = useState<string | null>(null);

  const { scrollYProgress } = useScrollAnimation();

  useEffect(() => {
    const experiencePageTimingId = PerformanceMonitor.startMeasuring('ExperiencePage Render');

    return () => {
      PerformanceMonitor.stopMeasuring(experiencePageTimingId);
    };
  }, []);

  const handleObjectSelected = useCallback((objectName: string) => {
    setSelectedObjectName(objectName);
    console.log(`Selected object in ExperiencePage: ${objectName}`);
  }, []);

  const advancedSceneModelPath = "models/warehouse.glb";

  return (
    <div className="font-open-sans">
      {error && (
        <div className="text-red-500 font-open-sans text-center mt-2">{`Error: ${error}`}</div>
      )}

      <section className="scroll-driven-content">
        <ScrollScene>
          {/* Add any content that should be animated based on scroll here */}
          <FadeIn>
            <div className="text-3xl font-bold text-darkGray font-roboto text-center mb-8">
              Scroll to Explore!
            </div>
            <p className="text-gray-500 font-open-sans text-center">
              Experience interactive animations as you scroll down the page.
            </p>
          </FadeIn>
        </ScrollScene>
      </section>

      <section className="interactive-scene-container" ref={sectionRef}>
        <AdvancedScene
            modelPath={advancedSceneModelPath}
            onObjectSelected={handleObjectSelected}
        />
        {selectedObjectName && (
          <FadeIn>
            <div className="selected-object-info">
              <p className="text-lg text-darkGray font-open-sans">
                Selected Object: {selectedObjectName}
              </p>
            </div>
          </FadeIn>
        )}
      </section>
    </div>
  );
}, (prevProps, nextProps) => {
  return true
});

export default ExperiencePage;