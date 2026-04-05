const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg').concat(['bin', 'json']),
  sourceExts: [...resolver.sourceExts, 'svg'],
};


config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
