const {withMasmott} = require('masmott/dist/es6/next')
/** @type {import('next').NextConfig} */
const nextConfig = ({
  reactStrictMode: true,
  swcMinify: true,
})

module.exports = withMasmott(nextConfig)
