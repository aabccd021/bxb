/* eslint-disable functional/no-conditional-statement */
import { Masmott } from 'core';

import { capitalize } from './utils';

const appTsx = `import type { AppProps } from 'next/app';
const MyApp = ({ Component, pageProps }: AppProps) => <Component {...pageProps} />;
export default MyApp;
`;

const pageTsx = (path: string) => `import { Page } from '@${path}';
import { NextPage } from 'next';
export default Page as NextPage;
`;

const isrTsx = (
  path: string,
  collection: string
) => `import { migration as migration_0_1 } from '@migration/0.1';
import { ${capitalize(collection)}PageData, ISRPage, makeISRPage } from '@masmott';
import { Page } from '@${path}';
import { makeGetStaticPaths, makeGetStaticProps } from 'masmott/dist/cjs';
const ISRPage = makeISRPage<${capitalize(
  collection
)}PageData>(migration_0_1.firebase, '${collection}', Page);
export default ISRPage;
export const getStaticPaths = makeGetStaticPaths();
export const getStaticProps = makeGetStaticProps('${collection}');
`;

const getPageTsx = (path: string, _masmott: Masmott) => {
  const [collectionName, fileName] = path.replace('web/', '').split('/');
  return collectionName === undefined ||
    fileName !== '[id]' ||
    !Object.keys(_masmott.spec[collectionName]?.view ?? {}).includes('page')
    ? pageTsx(path)
    : isrTsx(path, collectionName);
};

export const getPagesPaths = (
  masmott: Masmott,
  webPages: readonly string[]
): readonly (readonly [string, string])[] => [
  ['pages/_app.tsx', appTsx],
  ...webPages.map(
    (path) =>
      [
        `pages/${path.replace('web/', '')}`,
        getPageTsx(path.replace('.tsx', ''), masmott),
      ] as readonly [string, string]
  ),
];
