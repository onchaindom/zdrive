/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: '*.ipfs.dweb.link',
      },
      {
        protocol: 'https',
        hostname: 'zora.co',
      },
      {
        protocol: 'https',
        hostname: '*.zora.co',
      },
      {
        protocol: 'https',
        hostname: '*.choicecdn.com',
      },
      {
        protocol: 'https',
        hostname: 'magic.decentralized-content.com',
      },
    ],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    // Resolve MetaMask SDK issue with react-native-async-storage
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
};

export default nextConfig;
