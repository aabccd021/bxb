const {withMasmott} = require('masmott/next')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
/** @type {import('next').NextConfig} */
const nextConfig = ({
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    return ({
      ...config,
      optimization: {
        ...config.optimization,
        innerGraph: true,
      }
    });
  },
})

module.exports = withMasmott(withBundleAnalyzer(nextConfig))
