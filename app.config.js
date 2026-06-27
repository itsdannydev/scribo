module.exports = ({ config }) => {
  const buildAbi = process.env.BUILD_ABI;
  if (buildAbi) {
    return {
      ...config,
      plugins: [
        ...(config.plugins || []),
        ['./plugins/withAbiFilters', { abis: [buildAbi] }],
      ],
    };
  }
  return config;
};
