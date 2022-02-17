/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export const overwritePackageJson = (json: any) => ({
  ...json,
  dependencies: {
    ...(json['dependencies'] ?? {}),
    'firebase-admin': '^10.0.2',
    'firebase-functions': '^3.17.1',
    next: '^12.0.1',
    react: '17.0.2',
    'react-dom': '^17.0.2',
  },
  devDependencies: {
    ...(json['devDependencies'] ?? {}),
    '@types/jest': '^27.4.0',
    '@types/react': '17.0.32',
    autoprefixer: '^10.4.2',
    cypress: '^9.4.1',
    eslint: '^8.8.0',
    'firebase-tools': '^10.1.2',
    jest: '^27.4.7',
    postcss: '^8.4.6',
    prettier: '^2.5.1',
    'start-server-and-test': '^1.14.0',
    tailwindcss: '^3.0.18',
    'ts-jest': '^27.1.3',
    typescript: '^4.5.5',
  },
  engines: {
    node: '16',
  },
  eslintConfig: {
    extends: 'masmott',
  },
  jest: {
    preset: 'ts-jest',
    testMatch: ['**/test/**/*.test.ts'],
  },
  main: '.masmott/functions/index.js',
  private: true,
  scripts: {
    build: 'masmott build',
    dev: 'masmott dev',
    lint: 'masmott lint',
    start: 'masmott start',
    test: 'masmott test',
  },
  version: '0.1.0',
});
