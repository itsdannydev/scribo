module.exports = ({ config }) => {
  const buildAbi = process.env.BUILD_ABI;
  const isPreview = process.env.PREVIEW_BUILD === 'true';

  let result = { ...config };

  if (isPreview) {
    result.name = 'Scribo (Preview)';
    result.android = {
      ...result.android,
      package: 'com.danny.scribo.preview',
    };
  }

  if (buildAbi) {
    result.plugins = [
      ...(result.plugins || []),
      ['./plugins/withAbiFilters', { abis: [buildAbi] }],
    ];
  }

  return result;
};
