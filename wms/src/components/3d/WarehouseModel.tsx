import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from 'react-three-fiber';
import * as THREE from 'three@0.176.0';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { assetLoader } from '@/utils/assetLoader';
import { PerformanceMonitor } from '@/utils/performanceUtils';
import '@/styles/components/warehouse-model.css';

interface WarehouseModelProps {
  modelPath?: string;
  dracoDecoderPath?: string;
  onObjectSelected?: (objectName: string) => void;
}

const WarehouseModel: React.FC<WarehouseModelProps> = React.memo(({
  modelPath = "models/warehouse.glb",
  dracoDecoderPath,
  onObjectSelected,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [interactiveObjects, setInteractiveObjects] = useState<THREE.Object3D[]>([]);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scene, camera, gl } = useThree();

  const loadModel = useCallback(async () => {
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

      setInteractiveObjects([]); // Reset interactive objects
      const newInteractiveObjects: THREE.Object3D[] = [];
      gltf.scene.traverse((child: any) => {
        if (child instanceof THREE.Object3D) {
          const isInteractive = typeof child.userData.interactive === 'boolean' ? child.userData.interactive : false;
          if (isInteractive) {
            newInteractiveObjects.push(child);
          }
        }
      });

      setInteractiveObjects(newInteractiveObjects);

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
        scene?.remove(modelRef.current);
      }
      modelRef.current = gltf.scene;
      scene?.add(gltf.scene);
    } catch (e: any) {
      console.error("Error loading model:", e);
      setError(`Error loading model: ${e.message}`);
    }
  }, [modelPath, dracoDecoderPath, scene]);

  const setupOrbitControls = useCallback(() => {
    if (!camera || !gl) {
      setError("Camera or WebGL context not initialized");
      console.error("Camera or WebGL context not initialized");
      return;
    }
    try {
      const controls = new OrbitControls(camera, gl.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.minDistance = 2;
      controls.maxDistance = 10;
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

  const highlightObject = useCallback((object: THREE.Object3D | null) => {
    try {
      if (!object) {
        return;
      }

      object.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material: any) => {
              if (material && material.emissive) {
                material.emissive.setHex(0xffa500);
                material.emissiveIntensity = 0.5;
              }
            });
          } else {
            if (child.material && child.material.emissive) {
              child.material.emissive.setHex(0xffa500);
              child.material.emissiveIntensity = 0.5;
            }
          }
        }
      });
    } catch (e: any) {
      console.error("Error highlighting object:", e);
      setError(`Error highlighting object: ${e.message}`);
    }
  }, []);

  const unhighlightObject = useCallback((object: THREE.Object3D | null) => {
    try {
      if (!object) {
        return;
      }

      object.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material: any) => {
              if (material && material.emissive) {
                material.emissive.setHex(0x000000);
                material.emissiveIntensity = 0;
              }
            });
          } else {
            if (child.material && child.material.emissive) {
              child.material.emissive.setHex(0x000000);
              child.material.emissiveIntensity = 0;
            }
          }
        }
      });
    } catch (e: any) {
      console.error("Error unhighlighting object:", e);
      setError(`Error unhighlighting object: ${e.message}`);
    }
  }, []);

  const raycast = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    try {
      if (!camera || !(camera instanceof THREE.PerspectiveCamera)) {
        throw new Error("Camera not initialized or is not a PerspectiveCamera");
      }
      if (!scene) throw new Error("Scene not initialized");

      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        const object = intersects[0].object.parent;
        if (object && interactiveObjects.includes(object)) {
          unhighlightObject(null); // Unhighlight previously highlighted
          highlightObject(object);
          if (onObjectSelected) {
            onObjectSelected(object.name);
          }
        }
      } else {
        unhighlightObject(null); // Unhighlight previously highlighted
      }
    } catch (e: any) {
      console.error("Error during raycasting:", e);
      setError(`Error during raycasting: ${e.message}`);
    }
  }, [camera, scene, interactiveObjects, onObjectSelected, highlightObject, unhighlightObject]);

  useEffect(() => {
    loadModel();
    setupOrbitControls();

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
    };
  }, [loadModel, setupOrbitControls]);

  useFrame(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.update();
    }
  });

  return (
    <div className="warehouse-model-container">
      {error && (
        <div className="error-message">
          {`Error: ${error}`}
        </div>
      )}
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ fov: 75, position: [0, 1.5, 5] }}
        onCreated={({ gl, scene, camera }) => {
          try {
            setupOrbitControls();
          } catch (e: any) {
            console.error("Error in Canvas onCreated:", e);
            setError(`Error in Canvas onCreated: ${e.message}`);
          }
        }}
        onClick={raycast}
        aria-label="3D Warehouse Model"
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.modelPath === nextProps.modelPath &&
         prevProps.dracoDecoderPath === nextProps.dracoDecoderPath &&
         prevProps.onObjectSelected === nextProps.onObjectSelected;
});

export default WarehouseModel;