/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin'
const colors = require('tailwindcss/colors')

module.exports = {
  /**
   * Enable JIT mode for on-demand CSS generation.
   */
  mode: 'jit',
  /**
   * Specifies the files to scan for Tailwind CSS classes.
   * Includes all React components within the `src/` directory.
   */
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  /**
   * Theme configuration.
   * Extends the default Tailwind theme with custom settings.
   */
  theme: {
    /**
     * Custom color palette.
     * Adheres to WCAG AA color contrast guidelines for accessibility.
     */
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      blue: '#29ABE2', // Primary color
      darkGray: '#333333', // Secondary color
      teal: '#00FFCC', // Accent color
    },
    /**
     * Custom font families.
     * Uses Roboto for headings, Open Sans for body, and Montserrat for UI elements.
     */
    fontFamily: {
      'roboto': ['Roboto', 'sans-serif'],
      'open-sans': ['Open Sans', 'sans-serif'],
      'montserrat': ['Montserrat', 'sans-serif'],
    },
    /**
     * Custom spacing scale.
     * Uses multiples of 4 for consistent spacing.
     */
    spacing: {
      '0': '0px',
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '36px',
      '10': '40px',
      '11': '44px',
      '12': '48px',
      '13': '52px',
      '14': '56px',
      '15': '60px',
      '16': '64px',
    },
    /**
     * Responsive breakpoints.
     * Configured with pixel values for consistent responsive design.
     */
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
       /**
       * 3D specific extensions to enable more options for webGL rendering
       */
      transitionProperty: {
        'position': 'transform, translate, translate-x, translate-y, translate-z, top, left, right, bottom',
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-out-up': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0px)'
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.5s ease-out',
        'fade-out-up': 'fade-out-up 0.5s ease-out'
      },
    },
  },
  /**
   * Safelist configuration.
   * Prevents purging of dynamically constructed Tailwind classes.
   */
  safelist: [
    'bg-blue-500',
    'text-white',
    'p-4',
    'rounded',
    'transition-all',
    'duration-300',
    'ease-in-out',
    'hover:bg-blue-700',
    'transform',
    'rotate-45',
     {
            pattern: /translate-(x|y|z)-(\d+)/,
            variants: ['sm', 'md', 'lg', 'xl', '2xl'],
          },
    // Add more patterns as needed
  ],
  /**
   * Plugin configuration.
   * Integrates Tailwind plugins for additional functionality.
   */
  plugins: [
        plugin(function({ addUtilities }) {
          addUtilities({
            /*Rotate Y Utility*/
            '.rotate-y-180': {
              transform: 'rotateY(180deg)',
            },
            /*Preserve 3D Utility*/
            '.preserve-3d': {
              transformStyle: 'preserve-3d',
            },
             /* Backface Visibility Hidden Utility */
            '.backface-hidden': {
              backfaceVisibility: 'hidden',
            }
          })
        }),
    require('@tailwindcss/container-queries'),
  ],
}

/**
 * Example test snippets (not included in the configuration file).
 * These snippets are for verifying the correct application of theme settings.
 */
/*
// Test color application
<div className="bg-blue-500 text-white p-4 rounded">Test</div>

// Test font family application
<div className="font-roboto">Test</div>

// Test spacing scale application
<div className="m-4">Test</div>

// Test responsive breakpoints
<div className="text-sm md:text-base lg:text-lg">Test</div>
*/