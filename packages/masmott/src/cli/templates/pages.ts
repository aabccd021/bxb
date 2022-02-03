import { Masmott } from 'core';
import * as fs from 'fs';

const appTsx = `import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;

const pageTsx = (path: string) => `import Page from '@/web/${path}';
export default Page;
`;

// const isrTsx = (path: string, collection: string) => `import { masmott } from '@/masmott_config';
// import Page from '@/web/${path}';
// import { ISRPage, makeISRPage, ViewPath } from 'masmott';
// import { makeGetStaticPaths, makeGetStaticProps } from 'masmott/dist/cjs';
// const ISRPage = makeISRPage(masmott.firebase, '${collection}', Page);
// export default ISRPage;
// export const getStaticPaths = makeGetStaticPaths();
// export const getStaticProps = makeGetStaticProps(viewPath);
// `;

const readDirRec = (dir: string): readonly string[] =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((file) => (file.isDirectory() ? readDirRec(`${dir}/${file.name}`) : [file.name]));

const getPageTsx = (path: string, _masmott: Masmott) => pageTsx(path);

export const pages = (masmott: Masmott): readonly (readonly [string, string])[] => [
  ['app.tsx', appTsx],
  ...readDirRec('.').map((path) => [path, getPageTsx(path, masmott)] as readonly [string, string]),
];
