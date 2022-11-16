const {withMasmott} = require('masmott/dist/cjs/next')
/** @type {import('next').NextConfig} */
const nextConfig = ({
  reactStrictMode: true,
  swcMinify: true,
})

module.exports = withMasmott(nextConfig)
