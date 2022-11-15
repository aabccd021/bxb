/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  rewrites: async () => [
    {
      source: '/__masmott__/signIn',
      destination: '/masmott/signIn.html'
  }
  ],
}

module.exports = nextConfig
