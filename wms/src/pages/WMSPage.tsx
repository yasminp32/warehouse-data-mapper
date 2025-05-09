import React, { useState, useEffect } from 'react';
import FadeIn from '@/components/animations/FadeIn';
import Card from '@/components/ui/Card';
import SKUMapper from '@/components/wms/SKUMapper';
import DataCleaner from '@/components/wms/DataCleaner';
import AIDashboard from '@/components/wms/AIDashboard';
import { PerformanceMonitor } from '@/utils/performanceUtils';

interface WMSPageProps {}

const WMSPage: React.FC<WMSPageProps> = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wmsPageTimingId = PerformanceMonitor.startMeasuring('WMSPage Render');
    return () => {
      PerformanceMonitor.stopMeasuring(wmsPageTimingId);
    };
  }, []);

  try {
    return (
      <FadeIn>
        <div className="container mx-auto p-4 font-open-sans">
          <h2 className="text-3xl font-bold text-darkGray font-roboto text-center mb-8">
            Warehouse Management System
          </h2>

          <Card ariaLabel="SKU Mapping">
            <SKUMapper />
          </Card>

          <Card ariaLabel="Data Cleaning">
            <DataCleaner />
          </Card>

          <Card ariaLabel="AI Dashboard">
            <AIDashboard />
          </Card>
        </div>
      </FadeIn>
    );
  } catch (error: any) {
    console.error('Error rendering WMSPage:', error);
    setError(`Error rendering WMSPage: ${error.message}`);
    return (
      <div className="container mx-auto p-4 font-open-sans">
        <div className="text-red-500 font-open-sans text-center mt-2">
          {`Error: ${error}`}
        </div>
      </div>
    );
  }
};

export default WMSPage;