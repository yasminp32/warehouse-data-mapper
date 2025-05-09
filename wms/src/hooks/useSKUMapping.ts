import { useState, useCallback, useRef } from 'react';
import { assetLoader } from '@/utils/assetLoader';
import { dataUtils } from '@/utils/dataUtils';
import { sanitizeURL } from '@/hooks/useDataFetching';

interface SKUMappingResult {
  mappedMSKU: string | null;
  validFormat: boolean;
}

interface SKUMappingHook {
  loadMappingData: (filePath: string) => Promise<void>;
  mapSKUToMSKU: (sku: string) => SKUMappingResult;
  validateSKUFormat: (sku: string) => boolean;
  handleComboSKUs: (skuList: string[]) => string[];
  mappingData: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  setUploadedFile: (file: File | null) => void;
  logMappingAction: (action: string) => void;
}

const useSKUMapping = (): SKUMappingHook => {
  const [mappingData, setMappingData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const skuFormatRegex = useRef(/^[a-zA-Z0-9]{6,12}$/);
  const mappingDataCache = useRef<Record<string, string>>({});
  const skuValidationCache = useRef<Record<string, boolean>>({});

  const logMappingAction = useCallback((action: string) => {
    console.log(`SKU Mapping Action: ${action}`);
  }, []);

  const loadMappingData = useCallback(async (filePath: string) => {
    setIsLoading(true);
    setError(null);

    const sanitizedFilePath = sanitizeURL(filePath);

    try {
      const loadedData = await assetLoader(sanitizedFilePath);

      if (typeof loadedData === 'string') {
        const parsedData: Record<string, string> = {};
        const lines = loadedData.trim().split('\n');
        lines.forEach(line => {
          const [sku, msku] = line.split(',').map(item => item.trim());
          if (sku && msku) {
            parsedData[sku] = msku;
          }
        });
        setMappingData(parsedData);
        mappingDataCache.current = parsedData; // Update cache
        logMappingAction('Mapping data loaded successfully');
      } else {
        throw new Error('Invalid file format. Expected CSV or Excel convertible to string.');
      }
    } catch (e: any) {
      console.error('Error loading mapping data:', e);
      setError(`Error loading mapping data: ${e.message}`);
      logMappingAction(`Error loading mapping data: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [logMappingAction]);

  const mapSKUToMSKU = useCallback((sku: string): SKUMappingResult => {
    if (!sku) {
      return { mappedMSKU: null, validFormat: false };
    }

    if (mappingDataCache.current[sku]) {
       return { mappedMSKU: mappingDataCache.current[sku], validFormat: true };
    }

    const isValid = validateSKUFormat(sku);

    if (!isValid) {
      return { mappedMSKU: null, validFormat: false };
    }

    const msku = mappingData[sku];
    return { mappedMSKU: msku || null, validFormat: isValid };
  }, [mappingData]);

  const validateSKUFormat = useCallback((sku: string): boolean => {
     if (skuValidationCache.current[sku] !== undefined) {
            return skuValidationCache.current[sku];
        }
    const isValid = skuFormatRegex.current.test(sku);
    skuValidationCache.current[sku] = isValid; // Update validation cache
    return isValid;
  }, []);

  const handleComboSKUs = useCallback((skuList: string[]): string[] => {
    if (!Array.isArray(skuList)) {
      console.error('handleComboSKUs: skuList must be an array.');
      setError('Invalid input: skuList must be an array.');
      return [];
    }

    const delimiter = '+'; // Define the delimiter for combo SKUs
    const validatedSKUs: string[] = [];

    skuList.forEach(comboSKU => {
      if (typeof comboSKU !== 'string') {
        console.warn('handleComboSKUs: Encountered a non-string SKU in skuList. Skipping.');
        return; // Skip non-string SKUs
      }

      const skus = comboSKU.split(delimiter).map(sku => sku.trim());
      skus.forEach(sku => {
        if (validateSKUFormat(sku)) {
          validatedSKUs.push(sku);
        } else {
          console.warn(`handleComboSKUs: Invalid SKU format: ${sku}. Skipping.`);
        }
      });
    });

    return validatedSKUs;
  }, [validateSKUFormat]);

  return {
    loadMappingData,
    mapSKUToMSKU,
    validateSKUFormat,
    handleComboSKUs,
    mappingData,
    isLoading,
    error,
    setUploadedFile,
    logMappingAction,
  };
};

export { useSKUMapping };