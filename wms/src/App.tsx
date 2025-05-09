import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import MinimalLayout from './components/layout/MinimalLayout';
import { PerformanceMonitor } from './utils/performanceUtils';
import './styles/index.css';
import gsap from 'gsap';
import { AnimatePresence } from 'framer-motion';

const ModelShowcasePage = lazy(() => import('./pages/ModelShowcasePage'));
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const WMSPage = lazy(() => import('./pages/WMSPage'));

interface RouteDefinition {
  path: string;
  Component: React.ComponentType;
  breadcrumbName: string;
}

const routes: RouteDefinition[] = [
  { path: '/', Component: lazy(() => import('./pages/LandingHero')), breadcrumbName: 'Home' },
  { path: '/model-showcase', Component: ModelShowcasePage, breadcrumbName: 'Model Showcase' },
  { path: '/experience', Component: ExperiencePage, breadcrumbName: 'Experience' },
  { path: '/contact', Component: ContactPage, breadcrumbName: 'Contact' },
  { path: '/about', Component: AboutPage, breadcrumbName: 'About' },
  { path: '/analytics', Component: AnalyticsPage, breadcrumbName: 'Analytics' },
  { path: '/wms', Component: WMSPage, breadcrumbName: 'WMS' },
];

const NotFound = () => (
  <div className="flex items-center justify-center h-screen font-open-sans">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-darkGray">404 - Not Found</h1>
      <p className="text-lg text-gray-500">Sorry, the page you are looking for does not exist.</p>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const start = () => {
      PerformanceMonitor.startRouteTransition();
    };

    const end = () => {
      PerformanceMonitor.endRouteTransition(location.pathname);
    };

    start();

    return () => {
      end();
    };
  }, [location]);

  const breadcrumbs = routes
    .filter(route => location.pathname.startsWith(route.path))
    .map(route => ({
      path: route.path,
      name: route.breadcrumbName,
    }));

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <MinimalLayout>
      <div className="font-open-sans">
        <nav className="bg-blue-500 p-4 text-white font-roboto">
          <ul className="flex space-x-4">
            {routes.map((route) => (
              <li key={route.path}>
                <button
                  onClick={() => handleNavigation(route.path)}
                  className="hover:text-teal transition-colors duration-300"
                >
                  {route.breadcrumbName}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4">
          <nav aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumbs.map((crumb, index) => (
                <li className="inline-flex items-center" key={crumb.path}>
                  <a
                    href={crumb.path}
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                    {crumb.name}
                  </a>
                  {index < breadcrumbs.length - 1 && (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <Routes location={location} key={location.pathname}>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.Component />}
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </MinimalLayout>
  );
};

export default App;