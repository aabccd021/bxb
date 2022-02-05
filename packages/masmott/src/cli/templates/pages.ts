/* eslint-disable functional/no-conditional-statement */
import { Masmott } from 'core';
import { capitalize } from './utils';


const appTsx = `import type { AppProps } from 'next/app';
const MyApp = ({ Component, pageProps }: AppProps) => <Component {...pageProps} />;
export default MyApp;
`;

const pageTsx = (path: string) => `import Page from '@/${path}';
export default Page;
`;

const isrTsx = (path: string, collection: string) => `import { masmott } from '@/masmott.config';
import { ${capitalize(collection)}PageData } from '@/masmott.generated';
import Page from '@/${path}';
import { ISRPage, makeISRPage } from 'masmott';
import { makeGetStaticPaths, makeGetStaticProps } from 'masmott/dist/cjs';
const ISRPage = makeISRPage<${capitalize(
  collection
)}PageData>(masmott.firebase, '${collection}', Page);
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
