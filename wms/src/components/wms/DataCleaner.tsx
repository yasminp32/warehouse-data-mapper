import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataPanel from '@/components/ui/DataPanel';
import FadeIn from '@/components/animations/FadeIn';
import { useDataCleaning } from '@/hooks/useDataCleaning';
import '@/styles/components/wms/data-cleaner.css';
import { PerformanceMonitor } from '@/utils/performanceUtils';

interface DataCleanerProps {}

const DataCleaner: React.FC<DataCleanerProps> = () => {
  const [uploadedFileDetails, setUploadedFileDetails] = useState<{ name: string; size: number } | null>(null);
  const [cleanedData, setCleanedData] = useState<any>(null);
  const [columnToClean, setColumnToClean] = useState<string>('');
  const [cleaningRules, setCleaningRules] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { uploadedFile, setUploadedFile, cleanData, logCleaningAction } = useDataCleaning();

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
          const sanitizedContent = fileContent.replace(/<script>/gi, "&lt;script&gt;");
          setUploadedFile(file);
          setUploadedFileDetails({ name: file.name, size: file.size });
          setError(null);
          setCleanedData(null);
          logCleaningAction('File uploaded successfully');
        } else {
          throw new Error('File content is not a string.');
        }
      } catch (err: any) {
        console.error('Error reading file:', err);
        setError(`Error reading file: ${err.message}`);
        logCleaningAction(`File upload failed: ${err.message}`);
      }
    };

    reader.onerror = (err) => {
      console.error('File reading error:', err);
      setError('File reading error. Please try again.');
      logCleaningAction(`File upload failed: ${err}`);
    };

    reader.readAsText(file);
  }, [setUploadedFile, logCleaningAction]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: {
    'text/csv': ['.csv'],
    'application/vnd.ms-excel': ['.xls', '.xlsx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  }, maxSize: 5 * 1024 * 1024 });

  const handleCleanData = useCallback(async () => {
    if (!uploadedFile) {
      setError('Please upload a file first.');
      return;
    }

    if (!columnToClean || columnToClean.trim() === '') {
      setError('Please specify a column to clean.');
      return;
    }

    try {
      const startTime = PerformanceMonitor.startMeasuring('Data Cleaning');
      const results = await cleanData(uploadedFile, columnToClean, cleaningRules);
      setCleanedData(results);
      setError(null);
      PerformanceMonitor.stopMeasuring(startTime);
      logCleaningAction(`Data cleaning completed for column "${columnToClean}"`);
    } catch (err: any) {
      console.error('Error cleaning data:', err);
      setError(`Error cleaning data: ${err.message}`);
      setCleanedData(null);
      logCleaningAction(`Data cleaning failed: ${err.message}`);
    }
  }, [uploadedFile, columnToClean, cleaningRules, cleanData, logCleaningAction]);

  return (
    <FadeIn>
      <div className="container mx-auto p-4 font-open-sans">
        <h2 className="text-2xl font-bold text-darkGray font-roboto mb-4">Data Cleaner</h2>

        <Card ariaLabel="File Upload Section">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-darkGray font-roboto mb-2">Upload Data File</h3>
            <div {...getRootProps()} className="dropzone bg-white rounded shadow-md p-4 text-center cursor-pointer">
              <input {...getInputProps()} aria-label="Upload data file" />
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

        <Card ariaLabel="Data Cleaning Options">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-darkGray font-roboto mb-2">Data Cleaning Options</h3>
            <div className="mb-2">
              <label htmlFor="columnToClean" className="block text-gray-700 text-sm font-bold mb-2">
                Column to Clean:
              </label>
              <input
                type="text"
                id="columnToClean"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={columnToClean}
                onChange={(e) => setColumnToClean(e.target.value)}
                aria-label="Column to clean"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="cleaningRules" className="block text-gray-700 text-sm font-bold mb-2">
                Cleaning Rules (Optional):
              </label>
              <textarea
                id="cleaningRules"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={cleaningRules}
                onChange={(e) => setCleaningRules(e.target.value)}
                placeholder="Enter cleaning rules (e.g., remove whitespace, convert to uppercase)"
                aria-label="Cleaning rules"
              />
            </div>
            <Button onClick={handleCleanData} variant="primary" size="medium" ariaLabel="Clean Data" disabled={!uploadedFile}>
              Clean Data
            </Button>
          </div>
        </Card>

        <Card ariaLabel="Cleaned Data">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-darkGray font-roboto mb-2">Cleaned Data</h3>
            {cleanedData ? (
              <DataPanel title="Cleaned Data" data={cleanedData} />
            ) : (
              <p className="text-gray-500 font-open-sans">No cleaned data to display.</p>
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

export default DataCleaner;