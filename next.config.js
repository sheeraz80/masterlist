/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude problematic packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Exclude TensorFlow and related packages from webpack processing
    config.externals = config.externals || [];
    config.externals.push({
      '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
      'mock-aws-s3': 'commonjs mock-aws-s3',
      'aws-sdk': 'commonjs aws-sdk',
      'nock': 'commonjs nock',
      'chromadb': 'commonjs chromadb',
    });

    return config;
  },
  serverExternalPackages: ['@tensorflow/tfjs-node', 'chromadb'],
};

module.exports = nextConfig;