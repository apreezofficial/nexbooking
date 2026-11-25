const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// This app lives in apps/<name>; the shared theme, components and assets are at the repo root.
const repoRoot = path.resolve(__dirname, '../..');

const config = {
  watchFolders: [repoRoot],
  resolver: { nodeModulesPaths: [path.resolve(repoRoot, 'node_modules')] },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
