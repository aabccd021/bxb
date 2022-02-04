/* eslint-disable functional/no-conditional-statement */
import { Masmott } from 'core';
import * as fs from 'fs';

import { capitalize } from './utils';

const appTsx = `import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

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

const readDirRec = (dir: string): readonly string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((file) =>
      file.isDirectory() ? readDirRec(`${dir}/${file.name}`) : [`${dir}/${file.name}`]
    );

const getPageTsx = (path: string, _masmott: Masmott) => {
  const [collectionName, fileName] = path.replace('web/', '').split('/');
  return collectionName === undefined ||
    fileName !== '[id]' ||
    !Object.keys(_masmott.spec[collectionName]?.view ?? {}).includes('page')
    ? pageTsx(path)
    : isrTsx(path, collectionName);
};

export const getPagesPaths = (masmott: Masmott): readonly (readonly [string, string])[] => [
  ['pages/_app.tsx', appTsx],
  ...readDirRec('web').map(
    (path) =>
      [
        `pages/${path.replace('web/', '')}`,
        getPageTsx(path.replace('.tsx', ''), masmott),
      ] as readonly [string, string]
  ),
];
