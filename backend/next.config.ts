import type { NextConfig } from 'next'
import nrExternals from 'newrelic/load-externals'

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['newrelic'],
  },
  webpack: (config) => {
    nrExternals(config)
    return config
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3001' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ]
  },
}

export default nextConfig
