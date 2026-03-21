/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // enable browser source map generation during the production build
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  experimental: {
    // appDir: true,
  },
  // fix all before production. Now it slow the develop speed.
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // https://nextjs.org/docs/api-reference/next.config.js/ignoring-typescript-errors
    ignoreBuildErrors: true,
  },
  output: 'standalone',

  // --- HETZNER PROXY REWRITE FOR IMAGES ---
  async rewrites() {
    return [
      {
        source: '/files/:path*',
        // Hardcoded to your live German server to prevent Next.js confusion
        destination: 'http://91.98.174.46/v1/files/:path*',
      },
    ]
  },
}

module.exports = nextConfig