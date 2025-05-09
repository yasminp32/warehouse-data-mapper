import * as THREE from 'three@0.176.0';

interface SampleModel {
  id: string;
  name: string;
  path: string;
}

/**
 * @description An array of sample 3D models for testing and development purposes.
 * Paths are relative to the `public/models` directory.
 */
const SAMPLE_MODELS: SampleModel[] = [
  {
    id: 'warehouse-model',
    name: 'Warehouse',
    path: 'models/warehouse.glb',
  },
  {
    id: 'product-model',
    name: 'Product',
    path: 'models/product.glb',
  },
  {
    id: 'generic-object',
    name: 'Generic Object',
    path: 'models/product.glb', // Using the product model as a generic fallback
  },
];

/**
 * @description Retrieves a sample model object from the SAMPLE_MODELS array by its ID.
 * @param id - The unique identifier of the sample model to retrieve.
 * @returns The sample model object if found, otherwise undefined. Logs an error if no model is found.
 */
const getSampleModel = (id: string): SampleModel | undefined => {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error('getSampleModel: Invalid id provided. It must be a non-empty string.');
    return undefined;
  }

  const model = SAMPLE_MODELS.find((model) => model.id === id);

  if (!model) {
    console.error(`getSampleModel: No sample model found with id "${id}".`);
    return undefined;
  }

  return model;
};

export { SAMPLE_MODELS, getSampleModel };