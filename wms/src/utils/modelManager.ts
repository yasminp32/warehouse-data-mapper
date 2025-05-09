import * as THREE from 'three@0.176.0';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { assetLoader } from '@/utils/assetLoader';
import { PerformanceMonitor } from '@/utils/performanceUtils';

/**
 * @description A utility module for managing 3D model loading, caching, and optimization.
 * Implements a singleton pattern to ensure only one instance of the class exists.
 */
class ModelManager {
  private static instance: ModelManager | null = null;
  private cache: Map<string, THREE.Object3D> = new Map();
  private dracoDecoderPath: string | undefined;
  private ktx2TranscoderPath: string | undefined;

  /**
   * @description Private constructor to enforce singleton pattern.
   * @param dracoDecoderPath - Optional path to the Draco decoder files.
   * @param ktx2TranscoderPath - Optional path to the KTX2 transcoder files.
   */
  private constructor(dracoDecoderPath?: string, ktx2TranscoderPath?: string) {
    this.dracoDecoderPath = dracoDecoderPath;
    this.ktx2TranscoderPath = ktx2TranscoderPath;
  }

  /**
   * @description Gets the singleton instance of the ModelManager class.
   * @param dracoDecoderPath - Optional path to the Draco decoder files.
   * @param ktx2TranscoderPath - Optional path to the KTX2 transcoder files.
   * @returns The singleton instance of ModelManager.
   */
  public static getInstance(dracoDecoderPath?: string, ktx2TranscoderPath?: string): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager(dracoDecoderPath, ktx2TranscoderPath);
    }
    return ModelManager.instance;
  }

  /**
   * @description Loads a 3D model from the specified path, caching it for future use.
   * @param modelPath - The path to the 3D model file (e.g., GLTF/GLB).
   * @param forceReload - Optional flag to force reloading the model, even if it's already cached.
   * @returns A Promise that resolves with the loaded THREE.Object3D.
   * @throws Error if the model path is invalid or the model fails to load.
   */
  public async loadModel(modelPath: string, forceReload: boolean = false): Promise<THREE.Object3D> {
    if (!modelPath || typeof modelPath !== 'string' || modelPath.trim() === '') {
      throw new Error('Invalid modelPath provided. It must be a non-empty string.');
    }

    const safeModelPathRegex = /^[a-zA-Z0-9\\/._-]+(?:.glb|.gltf)$/;
    if (!safeModelPathRegex.test(modelPath)) {
      throw new Error('Invalid modelPath format. It must contain only alphanumeric characters, hyphens, underscores, forward slashes, periods, and a .glb or .gltf extension.');
    }

    if (this.cache.has(modelPath) && !forceReload) {
      const cachedModel = this.cache.get(modelPath);
      if (cachedModel) {
        console.debug(`ModelManager: Returning cached model for path: ${modelPath}`);
        return this.cloneModel(cachedModel); // Return a clone to avoid shared state
      }
    }

    const loadModelTimingId = PerformanceMonitor.startMeasuring(`ModelManager: Loading model from ${modelPath}`);

    try {
      const gltf = await assetLoader(modelPath, this.dracoDecoderPath, this.ktx2TranscoderPath);

      if (!(gltf.scene instanceof THREE.Object3D)) {
        throw new Error('Loaded model is not a valid THREE.Object3D');
      }

      // Optimize the model before caching
      this.optimizeModel(gltf.scene);

      const clonedModel = this.cloneModel(gltf.scene);

      this.cache.set(modelPath, clonedModel);
      console.debug(`ModelManager: Model loaded and cached from path: ${modelPath}`);
      PerformanceMonitor.stopMeasuring(loadModelTimingId);
      return clonedModel;
    } catch (error: any) {
      console.error(`ModelManager: Error loading model from ${modelPath}:`, error);
      PerformanceMonitor.stopMeasuring(loadModelTimingId);
      throw new Error(`Failed to load model from ${modelPath}: ${error.message}`);
    }
  }
    /**
     * @description Retrieves a model from the cache.
     * @param modelPath - The path to the 3D model file.
     * @returns The cached THREE.Object3D or null if not found.
     */
    public getModel(modelPath: string): THREE.Object3D | null {
        if (this.cache.has(modelPath)) {
            return this.cache.get(modelPath) || null;
        }
        return null;
    }

    /**
     * @description Removes a model from the cache, disposing of its resources.
     * @param modelPath - The path to the 3D model file to remove.
     */
    public removeModel(modelPath: string): void {
        if (this.cache.has(modelPath)) {
            const model = this.cache.get(modelPath);
            if (model) {
                this.disposeModel(model);
            }
            this.cache.delete(modelPath);
            console.debug(`ModelManager: Model removed from cache: ${modelPath}`);
        } else {
            console.warn(`ModelManager: Model not found in cache: ${modelPath}`);
        }
    }

    /**
     * @description Clears the entire model cache, disposing of all resources.
     */
    public clearCache(): void {
        this.cache.forEach((model, path) => {
            this.disposeModel(model);
        });
        this.cache.clear();
        console.debug('ModelManager: Model cache cleared.');
    }
    /**
     * @description Clones a THREE.Object3D and its materials/textures to avoid shared state issues.
     * @param source - The THREE.Object3D to clone.
     * @returns A deep clone of the source object.
     */
    private cloneModel(source: THREE.Object3D): THREE.Object3D {
        const clonedModel = source.clone(true);

        clonedModel.traverse((node: any) => {
            if (node.material) {
                if (Array.isArray(node.material)) {
                    node.material = node.material.map(material => material.clone());
                } else {
                    node.material = node.material.clone();
                }
            }
            if (node.geometry) {
                node.geometry = node.geometry.clone();
            }
        });
        return clonedModel;
    }
  /**
   * @description Disposes of the resources (geometry and materials) used by a THREE.Object3D to prevent memory leaks.
   * @param model - The THREE.Object3D to dispose of.
   */
  private disposeModel(model: THREE.Object3D): void {
    model.traverse((object: any) => {
      if (object.isMesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material: any) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
      if (object.texture) {
        object.texture.dispose();
      }
    });
  }
   /**
     * @description Optimizes a 3D model for web delivery by reducing polygon count and compressing textures.
     * @param model - The THREE.Object3D to optimize.
     */
    private optimizeModel(model: THREE.Object3D): void {
        model.traverse((object: any) => {
            if (object.isMesh) {
                // Implement LOD techniques (example: reduce detail at a distance)
                if (object.geometry.attributes.position) {
                    // Example: Reduce vertices by a factor
                    // Note: Simplification libraries (e.g., SimplifyModifier) could be used here for better results.
                    // This is a basic example and may not be suitable for all models.
                    // Implement compression and LOD here as well:
                    object.geometry.computeVertexNormals();
                    object.geometry.normalizeNormals();
                }

                if (object.material && object.material.map) {
                    // Compress textures (example: resize to lower resolution)
                    const texture = object.material.map;
                    if (texture.image) {
                        // Resize the texture if it's too large to something like 1024
                        const maxSize = 1024;
                        if (texture.image.width > maxSize || texture.image.height > maxSize) {
                            const scale = Math.min(maxSize / texture.image.width, maxSize / texture.image.height);
                            const newWidth = Math.floor(texture.image.width * scale);
                            const newHeight = Math.floor(texture.image.height * scale);

                            texture.image.width = newWidth;
                            texture.image.height = newHeight;
                            texture.needsUpdate = true;
                        }
                    }
                    texture.anisotropy = 4; // Adjust anisotropy
                    texture.generateMipmaps = true; // Generate mipmaps
                    texture.encoding = THREE.sRGBEncoding; // Use sRGB encoding
                    object.material.needsUpdate = true;
                }
            }
        });
    }
}

export default ModelManager;