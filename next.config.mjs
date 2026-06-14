/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // xlsx is only used in client import wizard / seed script; keep it external on server.
  serverExternalPackages: ['xlsx'],
};

export default nextConfig;
