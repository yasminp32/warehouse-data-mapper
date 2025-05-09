import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThreeScene from '@/components/3d/ThreeScene';
import { ModelLoader } from '@/components/3d/ModelLoader';
import ProductShowcase from '@/components/3d/ProductShowcase';
import Card from '@/components/ui/Card';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import { PerformanceMonitor } from '@/utils/performanceUtils';
import { useToggle } from '@/hooks/useToggle';
import '@/styles/pages/model-showcase.css';

const ModelShowcasePage: React.FC = React.memo(() => {
  const [selectedModelPath, setSelectedModelPath] = useState<string>("models/product.glb");
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const {isOn: showControls, toggle: toggleShowControls} = useToggle(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleModelLoadError = useCallback((errorMessage: string) => {
    setModelLoadError(errorMessage);
  }, []);

  const handleModelSelected = useCallback((objectName: string) => {
    console.log(`Selected 3D object: ${objectName}`);
  }, []);

  useEffect(() => {
    const modelShowcasePageTimingId = PerformanceMonitor.startMeasuring('ModelShowcasePage Render');

    return () => {
      PerformanceMonitor.stopMeasuring(modelShowcasePageTimingId);
    };
  }, []);

   const handleNavigateBack = () => {
        navigate(-1); // Navigates back one step in the browser history
    };

  const modelPaths = ["models/product.glb", "models/warehouse.glb"];

  return (
    <FadeIn>
      <div className="container mx-auto p-4 font-open-sans">
        <h2 className="text-3xl font-bold text-darkGray font-roboto text-center mb-8">
          Interactive 3D Model Showcase
        </h2>

        {modelLoadError && (
          <Card ariaLabel="Model Load Error">
            <div className="text-red-500 font-open-sans text-center">Error: {modelLoadError}</div>
          </Card>
        )}

        <Card ariaLabel="3D Model Showcase">
          <div className="p-4">
               <ProductShowcase
                modelPath={selectedModelPath}
                dracoDecoderPath={undefined}
                initialCameraPosition={new THREE.Vector3(0, 1.5, 5)}
                lightIntensity={0.7}
                onModelLoaded={undefined}
                />
          </div>
        </Card>

         <Card ariaLabel="Model Selection">
          <div className="p-4">
          <h3 className="text-xl font-semibold text-darkGray font-roboto mb-2">Choose another Model</h3>
             <ul className="flex space-x-4">
                  {modelPaths.map((path) => (
                  <li key={path}>
                       <Button
                           onClick={() => setSelectedModelPath(path)}
                           variant="primary"
                           size="medium"
                           ariaLabel={`Load ${path}`}
                       >
                           {path.split("/")[1].split(".")[0]}
                       </Button>
                  </li>
                  ))}
             </ul>
          </div>
        </Card>
          <Card ariaLabel="Toggle Controls">
          <div className="p-4">
               <Button onClick={handleNavigateBack} variant="primary" size="medium" ariaLabel="Go Back">
                    Go Back
               </Button>
          </div>
        </Card>
      </div>
    </FadeIn>
  );
}, (prevProps, nextProps) => {
    return true
});

export default ModelShowcasePage;