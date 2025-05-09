import * as THREE from 'three@0.176.0';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { PerformanceMonitor } from '@/utils/performanceUtils';

/**
 * @function assetLoader
 * @description Asynchronously loads assets like GLTF/GLB models, textures, and other data files using Three.js loaders with Draco and KTX2 compression support.
 * @param modelPath - The required path to the asset.
 * @param dracoDecoderPath - Optional path to Draco decoder files.
 * @param ktx2TranscoderPath - Optional path to KTX2 transcoder files.
 * @returns A Promise that resolves with the loaded asset.
 * @throws Error if the model path is invalid, the file extension is unsupported, or asset loading fails.
 *
 * @example
 * // Load a GLTF model
 * assetLoader('models/warehouse.glb')
 *   .then(gltf => {
 *     // Handle the loaded GLTF scene
 *     scene.add(gltf.scene);
 *   })
 *   .catch(error => {
 *     console.error('Error loading model:', error);
 *   });
 */
const assetLoader = async (
  modelPath: string,
  dracoDecoderPath?: string,
  ktx2TranscoderPath?: string
): Promise<any> => {
  if (!modelPath || typeof modelPath !== 'string' || modelPath.trim() === '') {
    throw new Error('Invalid modelPath provided. It must be a non-empty string.');
  }

  const safeModelPathRegex = /^[a-zA-Z0-9/._-]+(?:.glb|.gltf|.png|.jpg|.jpeg)$/;
  if (!safeModelPathRegex.test(modelPath)) {
    throw new Error(
      'Invalid modelPath format: Path must contain only alphanumeric characters, hyphens, underscores, forward slashes, periods, and a .glb, .gltf, .png, .jpg, or .jpeg extension.'
    );
  }

  const loadAssetTimingId = PerformanceMonitor.startMeasuring(`Loading asset from ${modelPath}`);

  try {
    const sanitizedPath = modelPath.startsWith('models/') || modelPath.startsWith('textures/') ? modelPath : `models/${modelPath}`;

    if (sanitizedPath.endsWith('.glb') || sanitizedPath.endsWith('.gltf')) {
      const gltfLoader = new GLTFLoader();

      if (dracoDecoderPath) {
        try {
          const dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath(dracoDecoderPath);
          gltfLoader.setDRACOLoader(dracoLoader);
        } catch (dracoError: any) {
          console.error('Failed to load DRACOLoader:', dracoError);
          throw new Error(`Failed to load DRACOLoader: ${dracoError.message}`);
        }
      }

      if (ktx2TranscoderPath) {
        try {
          const ktx2Loader = new KTX2Loader();
          //Assume ktx2TranscoderPath is a URL
          ktx2Loader.setTranscoderPath(ktx2TranscoderPath);
          gltfLoader.setKTX2Loader(ktx2Loader);
        } catch (ktx2Error: any) {
          console.error('Failed to load KTX2Loader:', ktx2Error);
          throw new Error(`Failed to load KTX2Loader: ${ktx2Error.message}`);
        }
      }

      return new Promise((resolve, reject) => {
        gltfLoader.load(
          sanitizedPath,
          (gltf) => {
            console.debug(`Successfully loaded GLTF model from ${sanitizedPath}`);
            PerformanceMonitor.stopMeasuring(loadAssetTimingId);
            resolve(gltf);
          },
          undefined,
          (error) => {
            console.error(`Error loading GLTF model from ${sanitizedPath}:`, error);
            PerformanceMonitor.stopMeasuring(loadAssetTimingId);
            reject(new Error(`Failed to load GLTF model from ${sanitizedPath}: ${error}`));
          }
        );
      });
    }
     else if (sanitizedPath.endsWith('.png') || sanitizedPath.endsWith('.jpg') || sanitizedPath.endsWith('.jpeg')) {
            const textureLoader = new THREE.TextureLoader();
            return new Promise((resolve, reject) => {
                textureLoader.load(
                    sanitizedPath,
                    (texture) => {
                        console.debug(`Successfully loaded texture from ${sanitizedPath}`);
                        PerformanceMonitor.stopMeasuring(loadAssetTimingId);
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading texture from ${sanitizedPath}:`, error);
                        PerformanceMonitor.stopMeasuring(loadAssetTimingId);
                        reject(new Error(`Failed to load texture from ${sanitizedPath}: ${error}`));
                    }
                );
            });
        }
    else {
      PerformanceMonitor.stopMeasuring(loadAssetTimingId);
      throw new Error(`Unsupported file extension for asset path: ${modelPath}. Only .glb, .gltf, .png, .jpg, and .jpeg are supported.`);
    }
  } catch (error: any) {
    console.error(`Error loading asset from ${modelPath}:`, error);
    PerformanceMonitor.stopMeasuring(loadAssetTimingId);
    throw error;
  }
};

export { assetLoader };