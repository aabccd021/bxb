const {withMasmott} = require('masmott/next')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
/** @type {import('next').NextConfig} */
const nextConfig = ({
  reactStrictMode: true,
  swcMinify: true,
})

module.exports = withBundleAnalyzer(withMasmott(nextConfig))
