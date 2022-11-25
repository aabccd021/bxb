const {withMasmott} = require('masmott/next')
/** @type {import('next').NextConfig} */
const nextConfig = ({
  reactStrictMode: true,
  swcMinify: true,
})

module.exports = withMasmott(nextConfig)
