// This is a replacement for the native.js file in Rollup
// It provides mock implementations of all required exports

// Mock parse function with a more complete AST structure
export function parse() {
  // Return a minimal but valid ESTree-compatible AST
  return {
    type: 'Program',
    sourceType: 'module',
    body: [
      {
        type: 'ExportNamedDeclaration',
        declaration: {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: {
                type: 'Identifier',
                name: 'dummy'
              },
              init: {
                type: 'Literal',
                value: 'dummy',
                raw: "'dummy'"
              }
            }
          ]
        },
        specifiers: [],
        source: null
      }
    ]
  };
}

// Mock parseAsync function with the same AST structure
export function parseAsync() {
  return Promise.resolve(parse());
}

// Mock getters for native plugins
export const getDefaultNativePlugins = () => [];
export const getDefaultNativePluginsForBuild = () => [];
export const getDefaultNativePluginsForBuildStart = () => [];
export const getDefaultNativePluginsForBuildEnd = () => [];
export const getDefaultNativePluginsForGenerate = () => [];
export const getDefaultNativePluginsForGenerateStart = () => [];
export const getDefaultNativePluginsForGenerateEnd = () => [];
export const getDefaultNativePluginsForTransform = () => [];
export const getDefaultNativePluginsForResolveDynamicImport = () => [];
export const getDefaultNativePluginsForResolveId = () => [];
export const getDefaultNativePluginsForLoad = () => [];
export const getDefaultNativePluginsForOptions = () => [];
export const getDefaultNativePluginsForRenderChunk = () => [];
export const getDefaultNativePluginsForRenderDynamicImport = () => [];
export const getDefaultNativePluginsForRenderError = () => [];
export const getDefaultNativePluginsForResolveDynamicImportMeta = () => [];
export const getDefaultNativePluginsForResolveImportMeta = () => [];
export const getDefaultNativePluginsForTransformChunk = () => [];
export const getDefaultNativePluginsForWatchChange = () => [];
export const getDefaultNativePluginsForWriteBundle = () => [];

// Mock hash functions that Rollup is trying to import
export function xxhashBase16(input) {
  // Simple mock implementation that returns a hex string
  return 'abcdef1234567890';
}

export function xxhashBase64Url(input) {
  // Simple mock implementation that returns a base64url string
  return 'abc123-_XYZ';
}

export function xxhashBase36(input) {
  // Simple mock implementation that returns a base36 string
  return 'abcdefghij';
}