import { jsonStringify } from './utils';

export const cypressJson = jsonStringify({
  baseUrl: 'http://localhost:5000',
});

export const nextEnvDTs = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;

export const nextConfigJs = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`;
