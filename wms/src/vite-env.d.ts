/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_THREE_ASSET_PATH: string;
  // ... other environment variables ...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  /**
   * @description Vite's `import.meta.glob` function with type support.  Loads files lazily.
   * @example
   * const modules = import.meta.glob('./modules/*.ts')
   *
   *  //ImportMeta Glob JSON Schema Validation Filename: vite-env.d.ts
   */
  glob: <T = Record<string, any>>(globPattern: string) => Promise<T>;
}