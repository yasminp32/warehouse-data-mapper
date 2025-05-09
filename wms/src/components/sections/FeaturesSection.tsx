import React, { useEffect, useRef, useState } from 'react';
import { Power2, gsap } from 'gsap';
import ThreeScene from '@/components/3d/ThreeScene';
import { ModelLoader } from '@/components/3d/ModelLoader';
import Card from '@/components/ui/Card';
import FadeIn from '@/components/animations/FadeIn';
import '@/styles/components/features-section.css';

interface Feature {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const FeaturesSection: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [featureRefs, setFeatureRefs] = useState<React.RefObject<HTMLDivElement>[]>([]);

  const features: Feature[] = [
    {
      id: 1,
      title: 'SKU-MSKU Mapping',
      description: 'Seamlessly map SKUs to MSKUs for streamlined inventory management and enhanced tracking accuracy.',
      imageUrl: 'path/to/placeholder-gear.glb',
    },
    {
      id: 2,
      title: 'Data Cleaning',
      description: 'Automated data cleaning processes ensure data integrity, reducing errors and improving decision-making.',
      imageUrl: 'path/to/placeholder-gear.glb',
    },
    {
      id: 3,
      title: 'AI-Driven Analytics',
      description: 'Harness the power of AI to gain actionable insights, optimize warehouse operations, and predict future trends.',
      imageUrl: 'path/to/placeholder-gear.glb',
    },
  ];

  useEffect(() => {
    const featureRefArray = features.map(() => React.createRef<HTMLDivElement>());
    setFeatureRefs(featureRefArray);
  }, [features.length]);

  useEffect(() => {
    const featuresSectionTimingId = PerformanceMonitor.startMeasuring('FeaturesSection Render');

    featureRefs.forEach((ref, index) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2 * index,
            ease: Power2.easeInOut,
          }
        );
      }
    });

    return () => {
      PerformanceMonitor.stopMeasuring(featuresSectionTimingId);
    };
  }, [featureRefs]);

  return (
    <section className="w-full py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-darkGray font-roboto text-center mb-8">Key Features</h2>
        {error ? (
          <div className="text-red-500 font-open-sans text-center">Error: {error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {features.map((feature, index) => (
              <FadeIn key={feature.id}>
                <div ref={featureRefs[index]}>
                  <Card>
                    <div className="flex items-center justify-center h-48">
                      <ModelLoader
                        path={feature.imageUrl}
                        onError={(message) => setError(message)}
                      >
                        <ThreeScene />
                      </ModelLoader>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-darkGray font-roboto mb-2">{feature.title}</h3>
                      <p className="text-gray-500 font-open-sans">{feature.description}</p>
                    </div>
                  </Card>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;