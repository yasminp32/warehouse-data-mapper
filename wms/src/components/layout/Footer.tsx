import React, { FC, useEffect } from 'react';
import { PerformanceMonitor } from '@/utils/performanceUtils';

/**
 * @version 0.1.0
 *
 * A functional component that displays the copyright information for the WMS MVP.
 */
const Footer: FC = () => {
  useEffect(() => {
    const footerTimingId = PerformanceMonitor.startMeasuring('Footer Render');
    return () => {
      PerformanceMonitor.stopMeasuring(footerTimingId);
    };
  }, []);

  try {
    const currentYear = new Date().getFullYear();

    return (
      <footer className="bg-darkGray text-white text-center py-3 font-roboto">
        <p>© {currentYear} WMS MVP. All rights reserved.</p>
      </footer>
    );
  } catch (error) {
    console.error('Error rendering Footer:', error);
    return (
      <footer className="bg-darkGray text-red-500 text-center py-3 font-roboto">
        <p>Error rendering footer. Please check the console.</p>
      </footer>
    );
  }
};

export default Footer;