import * as THREE from 'three@0.176.0';
import { assetLoader } from '@/utils/assetLoader';

/**
 * @module three-helpers
 * @description A utility module providing reusable helper functions for common Three.js tasks.
 */

/**
 * @function createBoxGeometry
 * @description Creates a THREE.BoxGeometry with specified dimensions and optional segment counts.
 * @param width - The width of the box. Must be a positive number.
 * @param height - The height of the box. Must be a positive number.
 * @param depth - The depth of the box. Must be a positive number.
 * @param widthSegments - Optional number of width segments. Defaults to 1. Must be a positive integer.
 * @param heightSegments - Optional number of height segments. Defaults to 1. Must be a positive integer.
 * @param depthSegments - Optional number of depth segments. Defaults to 1. Must be a positive integer.
 * @returns A THREE.BoxGeometry object.
 * @throws Error if any of the input parameters are invalid.
 * @performance Consider using a shared geometry if the same dimensions are used frequently.
 */
const createBoxGeometry = (
  width: number,
  height: number,
  depth: number,
  widthSegments: number = 1,
  heightSegments: number = 1,
  depthSegments: number = 1
): THREE.BoxGeometry => {
  if (typeof width !== 'number' || width <= 0) {
    throw new Error('Invalid width: Width must be a positive number.');
  }
  if (typeof height !== 'number' || height <= 0) {
    throw new Error('Invalid height: Height must be a positive number.');
  }
  if (typeof depth !== 'number' || depth <= 0) {
    throw new Error('Invalid depth: Depth must be a positive number.');
  }
    if (!Number.isInteger(widthSegments) || widthSegments <= 0) {
        throw new Error('Invalid widthSegments: widthSegments must be a positive integer.');
    }

    if (!Number.isInteger(heightSegments) || heightSegments <= 0) {
        throw new Error('Invalid heightSegments: heightSegments must be a positive integer.');
    }

    if (!Number.isInteger(depthSegments) || depthSegments <= 0) {
        throw new Error('Invalid depthSegments: depthSegments must be a positive integer.');
    }
  try {
    return new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
  } catch (e) {
    console.error('Error creating box geometry', e);
    throw e;
  }
};

/**
 * @function createSphereGeometry
 * @description Creates a THREE.SphereGeometry with specified radius and optional segment counts.
 * @param radius - The radius of the sphere. Must be a positive number.
 * @param widthSegments - Optional number of horizontal segments. Defaults to 32. Must be a positive integer.
 * @param heightSegments - Optional number of vertical segments. Defaults to 32. Must be a positive integer.
 * @returns A THREE.SphereGeometry object.
 * @throws Error if the radius is invalid.
 * @performance Consider using a shared geometry if the same radius is used frequently.
 */
const createSphereGeometry = (
  radius: number,
  widthSegments: number = 32,
  heightSegments: number = 32
): THREE.SphereGeometry => {
  if (typeof radius !== 'number' || radius <= 0) {
    throw new Error('Invalid radius: Radius must be a positive number.');
  }

    if (!Number.isInteger(widthSegments) || widthSegments <= 0) {
        throw new Error('Invalid widthSegments: widthSegments must be a positive integer.');
    }

    if (!Number.isInteger(heightSegments) || heightSegments <= 0) {
        throw new Error('Invalid heightSegments: heightSegments must be a positive integer.');
    }
  try {
    return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  } catch (e) {
    console.error('Error creating sphere geometry', e);
    throw e;
  }
};

/**
 * @function createPlaneGeometry
 * @description Creates a THREE.PlaneGeometry with specified dimensions and optional segment counts.
 * @param width - The width of the plane. Must be a positive number.
 * @param height - The height of the plane. Must be a positive number.
 * @param widthSegments - Optional number of width segments. Defaults to 1. Must be a positive integer.
 * @param heightSegments - Optional number of height segments. Defaults to 1. Must be a positive integer.
 * @returns A THREE.PlaneGeometry object.
 * @throws Error if width or height is invalid.
 * @performance Consider using a shared geometry if the same dimensions are used frequently.
 */
const createPlaneGeometry = (
  width: number,
  height: number,
  widthSegments: number = 1,
  heightSegments: number = 1
): THREE.PlaneGeometry => {
  if (typeof width !== 'number' || width <= 0) {
    throw new Error('Invalid width: Width must be a positive number.');
  }
  if (typeof height !== 'number' || height <= 0) {
    throw new Error('Invalid height: Height must be a positive number.');
  }
    if (!Number.isInteger(widthSegments) || widthSegments <= 0) {
        throw new Error('Invalid widthSegments: widthSegments must be a positive integer.');
    }

    if (!Number.isInteger(heightSegments) || heightSegments <= 0) {
        throw new Error('Invalid heightSegments: heightSegments must be a positive integer.');
    }
  try {
    return new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
  } catch (e) {
    console.error('Error creating plane geometry', e);
    throw e;
  }
};

/**
 * @function createBasicMaterial
 * @description Creates a THREE.MeshBasicMaterial with a specified hexadecimal color.
 * @param color - The hexadecimal color string (e.g., '#ffffff').
 * @returns A THREE.MeshBasicMaterial object.
 * @throws Error if the color string is invalid.
 * @performance Consider using a shared material if the same color is used frequently.
 */
const createBasicMaterial = (color: string): THREE.MeshBasicMaterial => {
  const hexColorRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
  if (typeof color !== 'string' || !hexColorRegex.test(color)) {
    throw new Error('Invalid color: Color must be a valid hexadecimal color string.');
  }
  try {
    return new THREE.MeshBasicMaterial({ color });
  } catch (e) {
    console.error('Error creating basic material', e);
    throw e;
  }
};

/**
 * @function createLambertMaterial
 * @description Creates a THREE.MeshLambertMaterial with a specified hexadecimal color.
 * @param color - The hexadecimal color string (e.g., '#ffffff').
 * @returns A THREE.MeshLambertMaterial object.
 * @throws Error if the color string is invalid.
 * @performance Consider using a shared material if the same color is used frequently.
 */
const createLambertMaterial = (color: string): THREE.MeshLambertMaterial => {
  const hexColorRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
  if (typeof color !== 'string' || !hexColorRegex.test(color)) {
    throw new Error('Invalid color: Color must be a valid hexadecimal color string.');
  }
  try {
    return new THREE.MeshLambertMaterial({ color });
  } catch (e) {
    console.error('Error creating lambert material', e);
    throw e;
  }
};

/**
 * @function createPhongMaterial
 * @description Creates a THREE.MeshPhongMaterial with specified color, specular color, and shininess.
 * @param color - The hexadecimal color string (e.g., '#ffffff').
 * @param specular - Optional hexadecimal specular color string (e.g., '#111111'). Defaults to '#111111'.
 * @param shininess - Optional shininess value. Defaults to 30. Must be a positive number.
 * @returns A THREE.MeshPhongMaterial object.
 * @throws Error if the color or specular color string is invalid, or if shininess is not a positive number.
 * @performance Consider using a shared material if the same properties are used frequently.
 */
const createPhongMaterial = (
  color: string,
  specular: string = '#111111',
  shininess: number = 30
): THREE.MeshPhongMaterial => {
  const hexColorRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
  if (typeof color !== 'string' || !hexColorRegex.test(color)) {
    throw new Error('Invalid color: Color must be a valid hexadecimal color string.');
  }
  if (typeof specular !== 'string' || !hexColorRegex.test(specular)) {
    throw new Error('Invalid specular color: Specular color must be a valid hexadecimal color string.');
  }
  if (typeof shininess !== 'number' || shininess <= 0) {
    throw new Error('Invalid shininess: Shininess must be a positive number.');
  }
  try {
    return new THREE.MeshPhongMaterial({ color, specular, shininess });
  } catch (e) {
    console.error('Error creating phong material', e);
    throw e;
  }
};

/**
 * @function loadTexture
 * @description Asynchronously loads a texture from the given path using THREE.TextureLoader and handles potential loading errors.
 * @param path - The path to the texture file.
 * @returns A Promise that resolves with the loaded THREE.Texture.
 * @throws Error if the texture path is invalid or the texture fails to load.
 * @performance Cache loaded textures to improve performance.
 */
const loadTexture = async (path: string): Promise<THREE.Texture> => {
    if (!path || typeof path !== 'string' || path.trim() === '') {
        throw new Error('Invalid texture path: Path must be a non-empty string.');
    }

    const safeTexturePathRegex = /^[a-zA-Z0-9/._-]+$/;
    if (!safeTexturePathRegex.test(path)) {
        throw new Error('Invalid texture path format: Path must contain only alphanumeric characters, hyphens, underscores, forward slashes, and periods.');
    }

  try {
        const sanitizedPath = path.startsWith('textures/') ? path : `textures/${path}`;
        const texture = await assetLoader(sanitizedPath);

        if (!(texture instanceof THREE.Texture)) {
            throw new Error('Loaded texture is not a valid THREE.Texture');
        }
        return texture;
    } catch (e: any) {
        console.error('Error loading texture', e);
        throw e;
    }
};

/**
 * @function createMesh
 * @description Creates a THREE.Mesh with the specified geometry and material, and enables or disables shadow casting and receiving.
 * @param geometry - The THREE.BufferGeometry to use for the mesh.
 * @param material - The THREE.Material to use for the mesh.
 * @param castShadow - Optional boolean to enable or disable shadow casting. Defaults to false.
 * @param receiveShadow - Optional boolean to enable or disable shadow receiving. Defaults to false.
 * @returns A THREE.Mesh object.
 * @throws Error if geometry or material is invalid.
 * @performance Cache materials and geometries if they are reused across multiple meshes.
 */
const createMesh = (
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  castShadow: boolean = false,
  receiveShadow: boolean = false
): THREE.Mesh => {
  if (!(geometry instanceof THREE.BufferGeometry)) {
    throw new Error('Invalid geometry: Geometry must be an instance of THREE.BufferGeometry.');
  }
  if (!(material instanceof THREE.Material)) {
    throw new Error('Invalid material: Material must be an instance of THREE.Material.');
  }
  try {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    return mesh;
  } catch (e) {
    console.error('Error creating mesh', e);
    throw e;
  }
};

/**
 * @function updateObjectPosition
 * @description Updates the position of a Three.js object.
 * @param object - The THREE.Object3D to update.
 * @param position - An object containing the x, y, and z coordinates.
 * @throws Error if object or position is invalid.
 */
const updateObjectPosition = (
  object: THREE.Object3D,
  position: { x: number; y: number; z: number }
): void => {
  if (!(object instanceof THREE.Object3D)) {
    throw new Error('Invalid object: Object must be an instance of THREE.Object3D.');
  }
  if (
    typeof position !== 'object' ||
    position === null ||
    typeof position.x !== 'number' ||
    typeof position.y !== 'number' ||
    typeof position.z !== 'number'
  ) {
    throw new Error('Invalid position: Position must be an object with x, y, and z properties, all of which must be numbers.');
  }
  try {
    object.position.set(position.x, position.y, position.z);
  } catch (e) {
    console.error('Error updating object position', e);
    throw e;
  }
};

/**
 * @function lookAt
 * @description Rotates a Three.js object to face a target vector.
 * @param object - The THREE.Object3D to rotate.
 * @param target - The THREE.Vector3 to look at.
 * @throws Error if object or target is invalid.
 */
const lookAt = (object: THREE.Object3D, target: THREE.Vector3): void => {
    if (!(object instanceof THREE.Object3D)) {
        throw new Error('Invalid object: Object must be an instance of THREE.Object3D.');
    }

    if (!(target instanceof THREE.Vector3)) {
        throw new Error('Invalid target: Target must be an instance of THREE.Vector3.');
    }
    try {
        object.lookAt(target);
    } catch (e) {
        console.error('Error setting object lookAt', e);
        throw e;
    }
};

/**
 * @function disposeObject
 * @description Recursively disposes of the object and its children's geometries and materials to prevent memory leaks.
 * @param object - The THREE.Object3D to dispose of.
 */
const disposeObject = (object: THREE.Object3D): void => {
  try {
    object.traverse((child: any) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((material: any) => material.dispose());
        } else {
          child.material?.dispose();
        }
      }
         if (child.isTexture) {
            (child as THREE.Texture).dispose();
        }
    });
  } catch (e) {
    console.error('Error disposing object', e);
    throw e;
  }
};

export {
  createBoxGeometry,
  createSphereGeometry,
  createPlaneGeometry,
  createBasicMaterial,
  createLambertMaterial,
  createPhongMaterial,
  loadTexture,
  createMesh,
  updateObjectPosition,
  lookAt,
  disposeObject,
};