const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // The library's `react-native` field points to TypeScript src/, but Metro can't
  // resolve directory imports (e.g. `./useWindowDimensions`) from TS source.
  // Redirect to the pre-compiled CommonJS output which Metro resolves correctly.
  if (moduleName === 'react-native-keyboard-controller') {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/react-native-keyboard-controller/lib/commonjs/index.js'
      ),
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
