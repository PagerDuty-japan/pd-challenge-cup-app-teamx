import type { NextConfig } from "next";
import nrExternals from 'newrelic/load-externals'

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['newrelic'],
  },
  webpack: (config) => {
    nrExternals(config)
    return config
  },
};

export default nextConfig;
