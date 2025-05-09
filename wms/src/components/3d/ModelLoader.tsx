import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three@0.176.0';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface ModelLoaderProps {
  modelPath: string;
  dracoDecoderPath?: string;
  onModelLoaded: (model: THREE.Object3D | null) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

export const ModelLoader: React.FC<ModelLoaderProps> = ({
  modelPath,
  dracoDecoderPath,
  onModelLoaded,
  onProgress,
  onError,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const loaderRef = useRef<GLTFLoader | null>(null);

  useEffect(() => {
    if (!modelPath || typeof modelPath !== 'string' || modelPath.trim() === '') {
      const errorMessage = 'Invalid modelPath provided. It must be a non-empty string.';
      console.error(errorMessage);
      setError(new Error(errorMessage));
      onError && onError(new Error(errorMessage));
      return;
    }

    setLoading(true);
    setError(null);

    const loader = new GLTFLoader();
    loaderRef.current = loader;

    if (dracoDecoderPath) {
      try {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(dracoDecoderPath);
        loader.setDRACOLoader(dracoLoader);
      } catch (dracoError: any) {
        console.error('Failed to load DRACOLoader:', dracoError);
        setError(dracoError);
        setLoading(false);
        onError && onError(dracoError);
        return;
      }
    }

    const sanitizedModelPath = modelPath.startsWith('models/') ? modelPath : `models/${modelPath}`;

    loader.load(
      sanitizedModelPath,
      (gltf) => {
        if (!(gltf.scene instanceof THREE.Object3D)) {
          const invalidModelError = new Error('Loaded model is not a valid THREE.Object3D');
          console.error('Invalid model loaded:', gltf);
          setError(invalidModelError);
          setLoading(false);
          onModelLoaded(null);
          onError && onError(invalidModelError);
          return;
        }

        onModelLoaded(gltf.scene);
        setLoading(false);
      },
      (xhr) => {
        const progress = xhr.total ? xhr.loaded / xhr.total : 0;
        onProgress && onProgress(progress);
      },
      (loadingError) => {
        console.error('An error happened during model loading:', loadingError);
        setError(loadingError);
        setLoading(false);
        onModelLoaded(null);
        onError && onError(loadingError);
      }
    );

    return () => {
      if (loaderRef.current) {
        loaderRef.current.manager.dispose();
        loaderRef.current.dispose();
      }
    };
  }, [modelPath, dracoDecoderPath, onModelLoaded, onProgress, onError]);

  return (
    <div>
      {loading && <div>Loading model...</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};