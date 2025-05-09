import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataPanel from '@/components/ui/DataPanel';
import FadeIn from '@/components/animations/FadeIn';
import { useSKUMapping } from '@/hooks/useSKUMapping';
import '@/styles/components/wms/sku-mapper.css';
import { PerformanceMonitor } from '@/utils/performanceUtils';

interface SKUMapperProps {}

const SKUMapper: React.FC<SKUMapperProps> = () => {
  const [uploadedFileDetails, setUploadedFileDetails] = useState<{ name: string; size: number } | null>(null);
  const [delimiter, setDelimiter] = useState<string>('+');
  const [comboSKUs, setComboSKUs] = useState<string>('');
  const [splitSKUs, setSplitSKUs] = useState<string[]>([]);
  const [skuToMap, setSkuToMap] = useState<string>('');
  const [mappedMSKU, setMappedMSKU] = useState<string>('');
  const [skuValidationError, setSkuValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mappingData, loadMappingData, mapSKUToMSKU, validateSKUFormat, handleComboSKUs, logMappingAction, setUploadedFile } = useSKUMapping();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const maxFileSizeMB = 5;
    const maxSize = maxFileSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
      setError(`File size exceeds the limit of ${maxFileSizeMB} MB.`);
      return;
    }

    const allowedTypes = {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    };

    const isValidFileType = Object.keys(allowedTypes).some(mimeType => {
      if (file.type === mimeType) {
        return true;
      }
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      return allowedTypes[mimeType]?.includes(`.${fileExtension}`);
    });

    if (!isValidFileType) {
      setError(`Invalid file type. Only CSV and Excel files are allowed.`);
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const fileContent = e.target?.result;
        if (typeof fileContent === 'string') {
          // Sanitize file data
          const sanitizedContent = fileContent.replace(/<script>/gi, "&lt;script&gt;");
          setUploadedFile(file);
          await loadMappingData(sanitizedContent);
          setUploadedFileDetails({ name: file.name, size: file.size });
          logMappingAction('File uploaded successfully');
          setError(null);
        } else {
          throw new Error('File content is not a string.');
        }
      } catch (err: any) {
        console.error('Error reading file:', err);
        setError(`Error reading file: ${err.message}`);
        logMappingAction(`File upload failed: ${err.message}`);
      }
    };

    reader.onerror = (err) => {
      console.error('File reading error:', err);
      setError('File reading error. Please try again.');
      logMappingAction(`File upload failed: ${err}`);
    };

    reader.readAsText(file);
  }, [loadMappingData, logMappingAction, setUploadedFile]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {
    'text/csv': ['.csv'],
    'application/vnd.ms-excel': ['.xls', '.xlsx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  }, maxSize: 5 * 1024 * 1024 });

  const handleMapSKU = useCallback(() => {
    setSkuValidationError(null);
    if (!skuToMap) {
      setSkuValidationError('SKU cannot be empty.');
      return;
    }

    const validationError = validateSKUFormat(skuToMap);
    if (validationError) {
      setSkuValidationError(validationError);
      return;
    }

    const msku = mapSKUToMSKU(skuToMap);
    setMappedMSKU(msku || 'No MSKU found for this SKU.');
    logMappingAction(`Mapped SKU ${skuToMap} to MSKU ${msku}`);
  }, [skuToMap, mapSKUToMSKU, validateSKUFormat, logMappingAction]);

  const handleComboSKUSplit = useCallback(() => {
    if (!comboSKUs) {
      setError('Combo SKUs cannot be empty.');
      return;
    }

    try {
      const skus = handleComboSKUs(comboSKUs.split('\n'));
      setSplitSKUs(skus);
      setError(null);
      logMappingAction(`Split combo SKUs using delimiter "${delimiter}"`);
    } catch (err: any) {
      console.error('Error splitting combo SKUs:', err);
      setError(`Error splitting combo SKUs: ${err.message}`);
    }
  }, [comboSKUs, handleComboSKUs, delimiter, logMappingAction]);

  return (
    <FadeIn>
      <div className="container mx-auto p-4 font-open-sans">
        <h2 className="text-2xl font-bold text-darkGray font-roboto mb-4">SKU Mapper</h2>

        <Card ariaLabel="File Upload Section">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-darkGray font-roboto mb-2">Upload Mapping File</h3>
            <div {...getRootProps()} className="dropzone bg-white rounded shadow-md p-4 text-center cursor-pointer">
              <input {...getInputProps()} aria-label="Upload mapping file"/>
              <p className="text-gray-500 font-open-sans">
                Drag 'n' drop some files here, or click to select files
              </p>
              {uploadedFileDetails && (
                <div className="mt-2">
                  <p className="text-gray-500 font-open-sans">
                    Uploaded: {uploadedFileDetails.name} ({Math.ceil(uploadedFileDetails.size / 1024)} KB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card ariaLabel="SKU Mappings">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-darkGray font-roboto mb-2">SKU Mappings</h3>
            {mappingData ? (
              <DataPanel title="Current Mappings" data={mappingData} />
            ) : (
              <p className="text-gray-500 font-open-sans">No mapping data loaded.</p>
            )}
          </div>
        </Card>

        <Card ariaLabel="Map SKU to MSKU">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-darkGray font-roboto mb-2">Map SKU to MSKU</h3>
            <div className="flex items-center mb-2">
              <input
                type="text"
                placeholder="Enter SKU"
                className="w-full p-2 border rounded text-darkGray font-open-sans"
                value={skuToMap}
                onChange={(e) => setSkuToMap(e.target.value)}
                aria-label="SKU to map"
              />
              <Button onClick={handleMapSKU} variant="primary" size="medium" ariaLabel="Map SKU">
                Map
              </Button>
            </div>
            {skuValidationError && (
              <div className="text-red-500 font-open-sans text-center mt-2">{`Error: ${skuValidationError}`}</div>
            )}
            {mappedMSKU && (
              <div className="mt-2">
                <p className="text-gray-500 font-open-sans">
                  MSKU: <span className="font-semibold">{mappedMSKU}</span>
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card ariaLabel="Handle Combo SKUs">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-darkGray font-roboto mb-2">Handle Combo SKUs</h3>
            <div className="mb-2">
              <label htmlFor="delimiter" className="block text-gray-700 text-sm font-bold mb-2">
                Delimiter:
              </label>
              <input
                type="text"
                id="delimiter"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                aria-label="Delimiter for combo SKUs"
              />
            </div>
            <textarea
              placeholder="Enter combo SKUs (one per line)"
              className="w-full p-2 border rounded text-darkGray font-open-sans"
              value={comboSKUs}
              onChange={(e) => setComboSKUs(e.target.value)}
              aria-label="Combo SKUs to split"
            />
            <Button onClick={handleComboSKUSplit} variant="primary" size="medium" ariaLabel="Split Combo SKUs">
              Split
            </Button>
            {splitSKUs.length > 0 && (
              <div className="mt-2">
                <h4 className="text-lg font-semibold text-darkGray font-roboto mb-2">Split SKUs:</h4>
                <ul className="list-disc list-inside text-gray-500 font-open-sans">
                  {splitSKUs.map((sku, index) => (
                    <li key={index}>{sku}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {error && (
          <div className="text-red-500 font-open-sans text-center mt-2">{`Error: ${error}`}</div>
        )}
      </div>
    </FadeIn>
  );
};

export default SKUMapper;