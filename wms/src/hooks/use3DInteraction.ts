import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from 'react-three-fiber';

interface Use3DInteractionReturn {
  handleCanvasClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

const use3DInteraction = (
  scene: THREE.Scene | undefined,
  camera: THREE.Camera | undefined
): Use3DInteractionReturn => {
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [error, setError] = useState<string | null>(null);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!scene) {
      console.error('use3DInteraction: Scene is not initialized. Cannot perform raycasting.');
      return;
    }

    if (!camera) {
      console.error('use3DInteraction: Camera is not initialized. Cannot perform raycasting.');
      return;
    }

    try {
      event.preventDefault();

      const canvas = event.currentTarget;
      if (!canvas) {
        console.error('use3DInteraction: Canvas element is not available.');
        return;
      }

      const rect = canvas.getBoundingClientRect();
      let normalizedMouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      let normalizedMouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (rect.width === 0 || rect.height === 0) {
        console.warn('use3DInteraction: Canvas dimensions are zero. Raycasting may not work correctly.');
        return;
      }

      mouseRef.current.x = normalizedMouseX;
      mouseRef.current.y = normalizedMouseY;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      if (!scene.children) {
        console.error('use3DInteraction: Scene children are not available.');
        return;
      }

      const intersects = raycasterRef.current.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        let intersectedObject = intersects[0].object.parent;

        if (!intersectedObject) {
          console.warn('use3DInteraction: Intersected object has no parent. Skipping.');
        }

        if (intersectedObject && (intersectedObject as any).selectable === true) {
          const sanitizedName = intersectedObject.name ? String(intersectedObject.name).replace(/[^\w\s]/gi, '') : '';

          if (event.currentTarget) {
            event.currentTarget.dispatchEvent(new CustomEvent('object-selected', { detail: {name: sanitizedName, object: intersectedObject }}));
          } else {
            console.error('use3DInteraction: event.currentTarget is null or undefined. Cannot dispatch event.');
          }
        }
      } else {
        if (event.currentTarget) {
             event.currentTarget.dispatchEvent(new CustomEvent('object-selected', { detail: null }));
          } else {
            console.error('use3DInteraction: event.currentTarget is null or undefined. Cannot dispatch event.');
          }
      }
    } catch (e: any) {
      console.error('use3DInteraction: Error during raycasting:', e);
      setError(`use3DInteraction: Error during raycasting: ${e.message}`);
    }
  }, [scene, camera]);

  useEffect(() => {
    const canvas = document.querySelector('canvas');

    if (canvas && scene && camera) {
      const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        handleCanvasClick(event);
      };

      canvas.addEventListener('click', handleClick as any);

      return () => {
        canvas.removeEventListener('click', handleClick as any);
      };
    }
  }, [handleCanvasClick, scene, camera]);

  return {
    handleCanvasClick,
  };
};

export default use3DInteraction;