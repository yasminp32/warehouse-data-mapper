import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

interface AdvancedSceneProps {
  model?: THREE.Object3D;
  onObjectSelected?: (objectName: string) => void;
}

const AdvancedScene: React.FC<AdvancedSceneProps> = React.memo(({ model, onObjectSelected }) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const originalMaterialsRef = useRef<Map<THREE.Object3D, THREE.Material | THREE.Material[]> | null>(null);
  const controlsRef = useRef<PointerLockControls | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scene, camera, gl } = useThree();

  const selectableObjects: THREE.Object3D[] = useMemo(() => {
    const selection: THREE.Object3D[] = [];
    if (model) {
      model.traverse((child) => {
        if ((child as any).selectable === true) {
          selection.push(child);
        }
      });
    }
    return selection;
  }, [model]);

  const highlightObject = useCallback((object: THREE.Object3D | null) => {
    try {
      if (!originalMaterialsRef.current) {
        originalMaterialsRef.current = new Map();
      }

      if (selectedObject) {
        const originalMaterial = originalMaterialsRef.current.get(selectedObject);
        if (originalMaterial) {
          if (Array.isArray(originalMaterial)) {
            selectedObject.traverse((child) => {
              if (child instanceof THREE.Mesh && Array.isArray(child.material)) {
                child.material = [...originalMaterial];
              }
            });
          } else if (selectedObject instanceof THREE.Mesh) {
            selectedObject.material = originalMaterial;
          }
        }
      }

      if (object) {
        if (!originalMaterialsRef.current.has(object)) {
          if (object instanceof THREE.Mesh) {
            originalMaterialsRef.current.set(object, object.material);
          } else {
            const materials: THREE.Material[] = [];
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                materials.push(child.material);
              }
            });
            originalMaterialsRef.current.set(object, materials);
          }
        }

        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const material = child.material;
            if (Array.isArray(material)) {
              material.forEach((mat: any) => {
                mat.emissive && (mat.emissive.setHex(0xffa500));
              });
            } else {
              (material as any).emissive && ((material as any).emissive.setHex(0xffa500));
            }
          }
        });

        setSelectedObject(object);
      } else {
        setSelectedObject(null);
      }
    } catch (e: any) {
      console.error("Error highlighting object:", e);
      setError(`Error highlighting object: ${e.message}`);
    }
  }, [selectedObject]);

  const onCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    try {
      if (!camera) throw new Error("Camera not initialized");
      if (!(camera instanceof THREE.PerspectiveCamera)) throw new Error("Camera is not a PerspectiveCamera");
      if (!scene) throw new Error("Scene not initialized");

      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(selectableObjects, true);

      if (intersects.length > 0) {
        const object = intersects[0].object.parent;
        if (object && (object as any).selectable === true) {
          highlightObject(object);
          if (onObjectSelected) {
            onObjectSelected(object.name);
          }
        }
      } else {
        highlightObject(null);
        setSelectedObject(null);
      }
    } catch (e: any) {
      console.error("Error during raycasting:", e);
      setError(`Error during raycasting: ${e.message}`);
    }
  }, [camera, scene, selectableObjects, onObjectSelected, highlightObject]);

  useEffect(() => {
    if (!gl || !camera) {
      setError("WebGL context or camera not initialized");
      console.error("WebGL context or camera not initialized");
      return;
    }
    try {
      const controls = new PointerLockControls(camera, gl.domElement);
      controlsRef.current = controls;

      const moveForward = (distance: number) => {
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        camera.position.add(direction.multiplyScalar(distance));
      };

      const moveRight = (distance: number) => {
        const right = new THREE.Vector3();
        camera.matrixWorld.extractBasis(undefined, right, undefined);
        camera.position.add(right.multiplyScalar(distance));
      };

      const onKeyDown = (event: KeyboardEvent) => {
        switch (event.code) {
          case 'ArrowUp':
          case 'KeyW':
            moveForward(0.1);
            break;
          case 'ArrowLeft':
          case 'KeyA':
            moveRight(-0.1);
            break;
          case 'ArrowDown':
          case 'KeyS':
            moveForward(-0.1);
            break;
          case 'ArrowRight':
          case 'KeyD':
            moveRight(0.1);
            break;
        }
      };

      const handleCanvasClick = () => {
        if (canvasRef.current) {
          controls.lock();
        }
      };

      const handleLockChange = () => {
        if (document.pointerLockElement === gl.domElement) {
          document.addEventListener('keydown', onKeyDown);
        } else {
          document.removeEventListener('keydown', onKeyDown);
        }
      };

      if (canvasRef.current) {
          canvasRef.current.addEventListener('click', handleCanvasClick);
      }
      document.addEventListener('pointerlockchange', handleLockChange);
      document.addEventListener('pointerlockerror', () => {
          console.error('PointerLockControls: Unable to use Pointer Lock API');
          setError('PointerLockControls: Unable to use Pointer Lock API');
      });

      return () => {
          document.removeEventListener('pointerlockchange', handleLockChange);
          document.removeEventListener('keydown', onKeyDown);
          if (canvasRef.current) {
              canvasRef.current.removeEventListener('click', handleCanvasClick);
          }
          controls.dispose();
      };
    } catch (e: any) {
      console.error("Error initializing PointerLockControls:", e);
      setError(`Error initializing PointerLockControls: ${e.message}`);
    }
  }, [camera, gl]);

  useEffect(() => {
    if (scene && model) {
      selectableObjects.forEach((obj) => {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.frustumCulled = true;
          }
        });
      });
    }
  }, [scene, model, selectableObjects]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {error && (
        <div style={{ position: 'absolute', top: 0, left: 0, color: 'red', padding: '10px', background: 'rgba(0,0,0,0.5)' }}>
          {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
        onClick={onCanvasClick}
        aria-label="3D Scene with advanced interactions"
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.model === nextProps.model && prevProps.onObjectSelected === nextProps.onObjectSelected;
});

export default AdvancedScene;