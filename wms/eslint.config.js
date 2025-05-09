/** @type {import('eslint').Linter.ConfigExport} */
export default [
  {
    // Define the environment (Node.js version and ECMAScript version)
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // Enable ECMAScript modules
      globals: {
        // Define global variables (e.g., browser, node)
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    // Specify files to lint
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    ignores: ['node_modules/**'],
  },
  {
    // Configure parser and plugins
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      prettier: require('eslint-plugin-prettier'),
      import: require('eslint-plugin-import'),
    },
    // Configuration for language features, here we set the tsconfig project to lint the code
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX syntax
        },
        project: [
          './tsconfig.json',
          './tsconfig.node.json',
          './tsconfig.app.json',
        ],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // Inherit rules from other configurations (Airbnb base and recommended rules)
    extends: [
      'eslint-config-airbnb-base',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    rules: {
      // Core ESLint rules
      'no-unused-vars': 'warn', // Warn about unused variables
      'no-console': 'warn', // Warn about console.log statements
      'no-unused-expressions': 'warn', // Warn about unused expressions
      semi: ['error', 'always'], // Enforce semicolons

      // Import plugin rules
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true, // Allows import of devDependencies in test files
          peerDependencies: true,
        },
      ],

      // React plugin rules
      'react/jsx-filename-extension': [
        'warn',
        { extensions: ['.tsx', '.jsx'] },
      ], // Allow JSX in .tsx and .jsx files
      'react/prop-types': 'off', // We use TypeScript for prop types
      'react/react-in-jsx-scope': 'off', // React is automatically in scope with Next.js
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-uses-react': 'off',

      // TypeScript plugin rules
      '@typescript-eslint/explicit-function-return-type': 'off', // Allows type inference for function return types
      '@typescript-eslint/no-explicit-any': 'warn', // Warns about using 'any' type
      '@typescript-eslint/no-unused-vars': 'warn', // Warns about unused variables (TypeScript version)
      '@typescript-eslint/consistent-type-imports': 'warn', // Enforce consistent usage of type imports
      '@typescript-eslint/no-shadow': 'warn', // Warns about variable shadowing
      '@typescript-eslint/no-unused-expressions': 'warn',
       "no-shadow": "off",
       "@typescript-eslint/no-shadow": ["warn"],
      // Prettier plugin rules
      'prettier/prettier': 'error', // Enforce Prettier formatting

      //A11y
      'jsx-a11y/accessible-emoji': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/heading-has-content': 'warn',
      'jsx-a11y/iframe-has-title': 'warn',
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/no-access-key': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-distracting-elements': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',
      'jsx-a11y/scope': 'warn',
      // Other rules and configurations
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
      'import/resolver': {
        typescript: {
          project: [
            './tsconfig.json',
            './tsconfig.node.json',
            './tsconfig.app.json',
          ],
        },
      },
    },
  },
  {
    // Overrides for specific file types
    files: ['*.config.js', '**/setupTests.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off', // Allow require() in config files
      'no-console': 'off', // Allow console.log in config files
    },
  },
  {
    // Disable eslint in specific parts of the project( optional )
    files: ['src/types/**/*.d.ts'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
];