import React, { useState, useEffect, Suspense, lazy } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { PerformanceMonitor } from '@/utils/performanceUtils';
import { AnimatePresence, motion } from 'framer-motion';

interface RouteDefinition {
  path: string;
  breadcrumbName: string;
}

const AppRoutes: RouteDefinition[] = [
  { path: '/', breadcrumbName: 'Home' },
  { path: '/model-showcase', breadcrumbName: 'Model Showcase' },
  { path: '/experience', breadcrumbName: 'Experience' },
  { path: '/contact', breadcrumbName: 'Contact' },
  { path: '/about', breadcrumbName: 'About' },
  { path: '/analytics', breadcrumbName: 'Analytics' },
  { path: '/wms', breadcrumbName: 'WMS' },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  useEffect(() => {
    const headerTimingId = PerformanceMonitor.startMeasuring('Header Render');
    return () => {
      PerformanceMonitor.stopMeasuring(headerTimingId);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderLogo = () => {
    try {
      const Logo = lazy(() => import('./Logo'));

      return (
        <Suspense fallback={<div className="h-8 w-8 bg-gray-200 animate-pulse"></div>}>
          <Logo />
        </Suspense>
      );
    } catch (error) {
      console.error('Error loading logo:', error);
      return <img src="/favicon.svg" alt="Default Logo" className="h-8 w-8" />;
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-darkGray shadow-md font-open-sans" role="banner">
      <nav className="container mx-auto py-4 px-6 flex items-center justify-between" role="navigation">
        <div className="flex items-center">
          {renderLogo()}
          <span className="ml-2 text-white font-bold text-lg">WMS MVP</span>
        </div>

        <div className="block md:hidden">
          <button
            onClick={toggleMenu}
            className="flex items-center px-3 py-2 border rounded text-teal border-teal-lighter hover:text-white hover:border-white"
            aria-label="Toggle navigation"
          >
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-6z" />
            </svg>
          </button>
        </div>

        <div className={`w-full block flex-grow md:flex md:items-center md:w-auto ${isMenuOpen ? 'block' : 'hidden'}`}>
          <motion.ul
            className="font-roboto md:flex md:justify-end flex-1 items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {AppRoutes.slice(0, isMenuOpen ? AppRoutes.length : 3).map((route) => (
              <motion.li key={route.path} className="md:ml-6 mt-2 md:mt-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: 0.1 * AppRoutes.indexOf(route) }}
              >
                <NavLink
                  to={route.path}
                  className={({ isActive }) =>
                    `block md:inline-block text-white hover:text-teal ${isActive ? 'text-teal' : ''} transition-colors duration-300`
                  }
                  aria-current={location.pathname === route.path ? "page" : undefined}
                  onClick={() => {
                    handleNavigation(route.path);
                    setIsMenuOpen(false);
                  }}
                  end={route.path === '/'}
                >
                  {route.breadcrumbName}
                </NavLink>
              </motion.li>
            ))}
              {AppRoutes.length > 3 && (
                <motion.li key="see-more" className="md:ml-6 mt-2 md:mt-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 * 3 }}
                >
                   {isMenuOpen ? null :
                        <button
                        onClick={toggleMenu}
                        className="block md:inline-block text-white hover:text-teal transition-colors duration-300"
                        aria-label="See more navigation links"
                      >
                        ...more
                      </button>
                   }
                   
                </motion.li>
              )}
          </motion.ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;