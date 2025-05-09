import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PerformanceMonitor } from '@/utils/performanceUtils';

interface ThreeSceneProps {
  model?: THREE.Object3D;
  backgroundColor?: string;
  cameraPosition?: THREE.Vector3;
  lightIntensity?: number;
}

const ThreeScene: React.FC<ThreeSceneProps> = React.memo(({ model, backgroundColor = '#ffffff', cameraPosition = new THREE.Vector3(0, 1, 5), lightIntensity = 0.7 }) => {
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const setupScene = useCallback((scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
    try {
      sceneRef.current = scene;
      cameraRef.current = camera;

      if (!scene) throw new Error("Scene not initialized");
      if (!camera) throw new Error("Camera not initialized");

      scene.background = new THREE.Color(backgroundColor);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, lightIntensity);
      directionalLight.position.set(1, 2, 3);
      scene.add(directionalLight);

      if (model) {
        scene.add(model);
      }
    } catch (e: any) {
      console.error("Error setting up scene:", e);
      setError(`Error setting up scene: ${e.message}`);
    }
  }, [backgroundColor, lightIntensity]);

  const resizeRendererToDisplaySize = useCallback((renderer: THREE.Renderer) => {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
      if (cameraRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    }
    return needResize;
  }, []);

  useFrame(({ gl, scene, camera }, delta) => {
    try {
      if (!gl) throw new Error("WebGL context not initialized");
      if (!scene) throw new Error("Scene not initialized");
      if (!camera) throw new Error("Camera not initialized");

      resizeRendererToDisplaySize(gl);

      if (animationMixerRef.current) {
        animationMixerRef.current.update(delta);
      }
      gl.render(scene, camera);
    } catch (e: any) {
      console.error("Error in animation frame:", e);
      setError(`Error in animation frame: ${e.message}`);
    }
  });

  useEffect(() => {
    const sceneTimingId = PerformanceMonitor.startMeasuring('ThreeScene Render');

    return () => {
      PerformanceMonitor.stopMeasuring(sceneTimingId);
    };
  }, []);

  const initializeOrbitControls = useCallback((camera: THREE.Camera, gl: THREE) => {
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
        LEFT: 'ArrowLeft', //left arrow
        UP: 'ArrowUp', // up arrow
        RIGHT: 'ArrowRight', // right arrow
        BOTTOM: 'ArrowDown' // down arrow
      }
      controlsRef.current = controls;

      return controls;
    } catch (e: any) {
      console.error("Error initializing OrbitControls:", e);
      setError(`Error initializing OrbitControls: ${e.message}`);
      return null;
    }
  }, []);

  const handleModelLoad = useCallback((object: THREE.Object3D) => {
    try {
      if (object && object.animations && object.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(object);
        animationMixerRef.current = mixer;
        object.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      }
    } catch (e: any) {
      console.error("Error setting up animation mixer:", e);
      setError(`Error setting up animation mixer: ${e.message}`);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {error && (
        <div style={{ position: 'absolute', top: 0, left: 0, color: 'red', padding: '10px', background: 'rgba(0,0,0,0.5)' }}>
          {error}
        </div>
      )}
      <Canvas
        style={{ background: backgroundColor }}
        camera={{ fov: 75, position: cameraPosition }}
        onCreated={({ gl, scene, camera }) => {
          try {
            setupScene(scene, camera);
            initializeOrbitControls(camera, gl);
          } catch (e: any) {
            console.error("Error in Canvas onCreated:", e);
            setError(`Error in Canvas onCreated: ${e.message}`);
          }
        }}
        aria-label="3D Scene"
      >
        {model && <primitive object={model} onUpdate={handleModelLoad} />}
      </Canvas>
    </div>
  );
}, (prevProps, nextProps) => {
  // React.memo comparison function
  return prevProps.model === nextProps.model &&
         prevProps.backgroundColor === nextProps.backgroundColor &&
         prevProps.lightIntensity === nextProps.lightIntensity &&
         prevProps.cameraPosition === nextProps.cameraPosition;
});

export default ThreeScene;