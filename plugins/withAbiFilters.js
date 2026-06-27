const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAbiFilters(config, { abis }) {
  return withAppBuildGradle(config, (config) => {
    const allAbis = ['arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'];
    const excludeAbis = allAbis.filter((a) => !abis.includes(a));
    const excludeLines = excludeAbis
      .map((abi) => `        exclude "lib/${abi}/**"`)
      .join('\n');

    const block = `\n    packagingOptions {\n${excludeLines}\n    }`;

    // Append packagingOptions right after the opening `android {` line
    config.modResults.contents = config.modResults.contents.replace(
      /^android \{/m,
      `android {${block}`
    );

    return config;
  });
};
