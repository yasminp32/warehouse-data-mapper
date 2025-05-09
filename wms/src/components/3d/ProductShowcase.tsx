import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from 'react-three-fiber';
import * as THREE from 'three@0.176.0';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { assetLoader } from '@/utils/assetLoader';
import '@/styles/components/product-showcase.css';

interface ProductShowcaseProps {
  modelPath: string;
  dracoDecoderPath?: string;
  initialCameraPosition?: THREE.Vector3;
  lightIntensity?: number;
  onModelLoaded?: (model: THREE.Object3D) => void;
}

const ProductShowcase: React.FC<ProductShowcaseProps> = React.memo(({
  modelPath,
  dracoDecoderPath,
  initialCameraPosition = new THREE.Vector3(0, 1.5, 5),
  lightIntensity = 0.7,
  onModelLoaded,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);

  const { scene, camera, gl } = useThree();

  const loadModel = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const gltf = await assetLoader(modelPath, dracoDecoderPath);

      if (!(gltf.scene instanceof THREE.Object3D)) {
        throw new Error('Loaded model is not a valid THREE.Object3D');
      }

      gltf.scene.traverse((child) => {
        if ((child as any).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      if (modelRef.current) {
        scene?.remove(modelRef.current);

        modelRef.current.traverse((object: any) => {
          if (object.isMesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material: any) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      modelRef.current = gltf.scene;
      scene?.add(gltf.scene);

      if (onModelLoaded) {
        onModelLoaded(gltf.scene);
      }

    } catch (e: any) {
      console.error("Error loading model:", e);
      setError(`Error loading model: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [modelPath, dracoDecoderPath, scene, onModelLoaded]);

  const setupOrbitControls = useCallback(() => {
    if (!camera || !gl) {
      const message = "Camera or WebGL context not initialized";
      setError(message);
      console.error(message);
      return;
    }

    try {
      const controls = new OrbitControls(camera, gl.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.keys = {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown'
      };
      orbitControlsRef.current = controls;
    } catch (e: any) {
      console.error("Error initializing OrbitControls:", e);
      setError(`Error initializing OrbitControls: ${e.message}`);
    }
  }, [camera, gl]);

  const setupLights = useCallback(() => {
    if (!scene) {
      const message = "Scene not initialized";
      setError(message);
      console.error(message);
      return;
    }
    try {
      const directionalLight = new THREE.DirectionalLight(0xffffff, lightIntensity);
      directionalLight.position.set(1, 2, 3);
      scene.add(directionalLight);
      directionalLightRef.current = directionalLight;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);

    } catch (e: any) {
      console.error("Error setting up lights:", e);
      setError(`Error setting up lights: ${e.message}`);
    }
  }, [scene, lightIntensity]);

  useEffect(() => {
    loadModel();
    setupOrbitControls();
    setupLights();

    return () => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.dispose();
      }

      if (modelRef.current) {
        modelRef.current.traverse((object: any) => {
          if (object.isMesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material: any) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      if (directionalLightRef.current) {
        scene?.remove(directionalLightRef.current);
      }
    };
  }, [loadModel, setupOrbitControls, setupLights, scene]);

  useFrame(() => {\n    if (orbitControlsRef.current) {\n      orbitControlsRef.current.update();\n    }\n  });

  const handleCanvasClick = useCallback(() => {
    if (canvasRef.current && orbitControlsRef.current) {
      try {
        // Locking the controls may trigger a security exception
        orbitControlsRef.current.dispose();
      } catch (e: any) {
        console.error("Error in disposing OrbitControls controls:", e);
        setError(`Error in disposing OrbitControls controls: ${e.message}`);
      }
    }
  }, []);

  useEffect(() => {\n    const onKeyDown = (event: KeyboardEvent) => {\n        if (!orbitControlsRef.current) return; // Ensure controls are initialized\n\n        try {\n            // Get current camera direction\n            const moveSpeed = 0.05; // Define movement speed\n\n            switch (event.code) {\n                case 'ArrowUp':\n                case 'KeyW':\n                    // Move camera forward\n                    camera.position.z -= moveSpeed;\n                    break;\n                case 'ArrowDown':\n                case 'KeyS':\n                    // Move camera backward\n                    camera.position.z += moveSpeed;\n                    break;\n                case 'ArrowLeft':\n                case 'KeyA':\n                    // Move camera to the left\n                    camera.position.x -= moveSpeed;\n                    break;\n                case 'ArrowRight':\n                case 'KeyD':\n                    // Move camera to the right\n                    camera.position.x += moveSpeed;\n                    break;\n\n                default:\n                    break; // Ignore other keys\n            }\n            // Update orbit controls after manual camera movement\n            orbitControlsRef.current.update();\n\n        } catch (e: any) {\n            console.error(\"Error keyboard handling:\", e);\n            setError(`Error handling keyboard event: ${e.message}`);\n        }\n    };\n    document.addEventListener('keydown', onKeyDown);\n    return () => {\n      document.removeEventListener('keydown', onKeyDown);\n    };\n  }, [camera]);

  return (\n    <div className=\"product-showcase-container\">\n      {error && (\n        <div className=\"error-message\">\n          {`Error: ${error}`}\n        </div>\n      )}\n      <Canvas\n        style={{ width: '100%', height: '100%' }}\n        camera={{ fov: 75, position: initialCameraPosition }}\n        onCreated={({ gl, scene, camera }) => {\n          try {\n            setupScene && setupScene(scene, camera);\n            setupOrbitControls();\n            setupLights();\n          } catch (e: any) {\n            console.error(\"Error in Canvas onCreated:\", e);\n            setError(`Error in Canvas onCreated: ${e.message}`);\n          }\n        }}\n        aria-label=\"3D Product Showcase\"\n        onClick={handleCanvasClick}\n        ref={canvasRef}\n      >\n        {modelRef.current && <primitive object={modelRef.current} />}\n      </Canvas>\n        {isLoading && <div className=\"loading-indicator\">Loading model...</div>}\n    </div>\n  );\n}, (prevProps, nextProps) => {\n  return prevProps.modelPath === nextProps.modelPath &&\n         prevProps.dracoDecoderPath === nextProps.dracoDecoderPath &&\n         prevProps.initialCameraPosition === nextProps.initialCameraPosition &&\n         prevProps.lightIntensity === nextProps.lightIntensity &&\n         prevProps.onModelLoaded === nextProps.onModelLoaded;\n});

export default ProductShowcase;