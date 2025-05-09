import { useState, useCallback, useRef } from 'react';
import { assetLoader } from '@/utils/assetLoader';
import { dataUtils } from '@/utils/dataUtils';
import { sanitizeURL } from '@/hooks/useDataFetching';

interface DataCleaningHook {
  loadData: (filePath: string) => Promise<void>;
  cleanData: (data: any[], cleaningRules: CleaningRule[]) => any[];
  validateData: (data: any[], validationSchema: ValidationSchema) => ValidationError[];
  cleanedData: any[] | null;
  isLoading: boolean;
  error: string | null;
  setUploadedFile: (file: File | null) => void;
  logCleaningAction: (action: string) => void;
}

interface CleaningRule {
  field: string;
  transformation: (value: any) => any;
}

interface ValidationSchema {
  [field: string]: {
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    regex?: RegExp;
  };
}

interface ValidationError {
  field: string;
  message: string;
}

const useDataCleaning = (): DataCleaningHook => {
  const [cleanedData, setCleanedData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const logCleaningAction = useCallback((action: string) => {
    console.log(`Data Cleaning Action: ${action}`);
  }, []);

  const loadData = useCallback(async (filePath: string) => {
    setIsLoading(true);
    setError(null);

    const sanitizedFilePath = sanitizeURL(filePath);

    try {
      const loadedData = await assetLoader(sanitizedFilePath);

      if (typeof loadedData === 'string') {
        try {
          const parsedData = dataUtils.parseCSVData(loadedData);
          setCleanedData(parsedData);
          logCleaningAction('CSV data loaded successfully');
        } catch (csvError: any) {
          console.error('Error parsing CSV data:', csvError);
          setError(`Error parsing CSV data: ${csvError.message}`);
          logCleaningAction(`Data loading failed: ${csvError.message}`);
        }
      } else if (typeof loadedData === 'object' && Array.isArray(loadedData)) {
        setCleanedData(loadedData);
        logCleaningAction('JSON data loaded successfully');
      }
      else {
        throw new Error('Invalid file format. Expected CSV or JSON.');
      }
    } catch (e: any) {
      console.error('Error loading data:', e);
      setError(`Error loading data: ${e.message}`);
      logCleaningAction(`Data loading failed: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [logCleaningAction]);

  const cleanData = useCallback((data: any[], cleaningRules: CleaningRule[]): any[] => {
    if (!Array.isArray(data)) {
      console.error('cleanData: Input data must be an array.');
      setError('Invalid input: Data must be an array.');
      return [];
    }

    if (!Array.isArray(cleaningRules)) {
      console.error('cleanData: Cleaning rules must be an array.');
      setError('Invalid input: Cleaning rules must be an array.');
      return data; // Return original data if cleaning rules are invalid
    }

    try {
      const cleaned: any[] = data.map(item => {
        if (typeof item !== 'object' || item === null) {
          console.warn('cleanData: Skipping non-object item in data array.');
          return item; // Skip non-object items
        }

        const newItem = { ...item };
        cleaningRules.forEach(rule => {
          if (typeof rule.field !== 'string') {
            console.warn('cleanData: Invalid rule field. Skipping transformation.');
            return;
          }
          if (typeof rule.transformation !== 'function') {
            console.warn(`cleanData: Transformation for field ${rule.field} is not a function. Skipping.`);
            return;
          }

          if (newItem.hasOwnProperty(rule.field)) {
            try {
              newItem[rule.field] = rule.transformation(newItem[rule.field]);
            } catch (transformError: any) {
              console.error(`cleanData: Error applying transformation to field ${rule.field}:`, transformError);
              setError(`Error applying transformation to field ${rule.field}: ${transformError.message}`);
            }
          }
        });
        return newItem;
      });
      return cleaned;
    } catch (e: any) {
      console.error('cleanData: Error cleaning data:', e);
      setError(`cleanData: Error cleaning data: ${e.message}`);
      return data; // Return original data in case of error
    }
  }, []);

  const validateData = useCallback((data: any[], validationSchema: ValidationSchema): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    if (!Array.isArray(data)) {
      console.error('validateData: Data must be an array.');
      setError('Invalid input: Data must be an array.');
      return [];
    }

    if (typeof validationSchema !== 'object' || validationSchema === null) {
      console.error('validateData: Validation schema must be an object.');
      setError('Invalid input: Validation schema must be an object.');
      return [];
    }

    data.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) {
        console.warn(`validateData: Skipping non-object item at index ${index}.`);
        return; // Skip non-object items
      }

      for (const field in validationSchema) {
        if (validationSchema.hasOwnProperty(field)) {
          const schema = validationSchema[field];
          const value = item[field];

          if (schema.required && (value === null || value === undefined || value === '')) {
            validationErrors.push({ field, message: `${field} is required.` });
          }

          if (value !== null && value !== undefined) {
            if (schema.type === 'string' && typeof value !== 'string') {
              validationErrors.push({ field, message: `${field} must be a string.` });
            } else if (schema.type === 'number' && typeof value !== 'number') {
              validationErrors.push({ field, message: `${field} must be a number.` });
            } else if (schema.type === 'boolean' && typeof value !== 'boolean') {
              validationErrors.push({ field, message: `${field} must be a boolean.` });
            }

            if (schema.type === 'string' && schema.regex && typeof value === 'string') {
              if (!schema.regex.test(value)) {
                validationErrors.push({ field, message: `${field} does not match the required pattern.` });
              }
              //Prevent XSS
              const cleanValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
              item[field] = cleanValue;
            }
          }
        }
      }
    });

    return validationErrors;
  }, []);

  return {
    loadData,
    cleanData,
    validateData,
    cleanedData,
    isLoading,
    error,
    setUploadedFile,
    logCleaningAction,
  };
};

export { useDataCleaning };