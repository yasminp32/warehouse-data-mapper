import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { PerformanceMonitor } from './utils/performanceUtils';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

PerformanceMonitor.startMonitoring();

window.addEventListener('beforeunload', () => {
  PerformanceMonitor.stopMonitoring();
  PerformanceMonitor.reportMetrics();
});