/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@team-up-main/api-client'],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
export default nextConfig;
