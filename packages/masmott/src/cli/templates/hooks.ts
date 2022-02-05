import { CollectionDS, CollectionSpec, Spec, VS } from 'core';

import { capitalize as cap } from './utils';

// import { useDocCreationWithPage } from 'masmott';
// import { masmott } from './masmott.config';

// export type PostData = {
//   readonly text: string;
//   readonly title: string;
// };

// export type PostPageData = {
//   readonly text: string;
//   readonly title: string;
// };

// export type PostCardData = {
//   readonly title: string;
// };

// export type PostCreationData = {
//   readonly text: string;
//   readonly title: string;
// };

// export const usePostCreation = () =>
//   useDocCreationWithPage<PostData, PostCreationData>(
//     masmott.firebase,
//     'post',
//     masmott.spec.post.view
//   );
// ;

const docDataFieldStr = (key: string) => `readonly ${key}: string;`;

const docDataFieldsStr = (collectionDs: CollectionDS | undefined) =>
  Object.keys(collectionDs ?? {})
    .map(docDataFieldStr)
    .join('\n');

const docDataStr = (collectionName: string, colDs: CollectionDS | undefined) =>
  `export type ${cap(collectionName)}Data = {
${docDataFieldsStr(colDs)}
}`;

const viewDataFieldsStr = (colDs: CollectionDS | undefined, vs: VS) =>
  Object.keys(colDs ?? {})
    .filter((key) => Object.keys(vs.select ?? {}).includes(key))
    .map(docDataFieldStr)
    .join('\n');

const viewDataStr =
  (colName: string, colDs: CollectionDS | undefined) =>
  ([viewName, vs]: readonly [string, VS]) =>
    `export type ${cap(colName)}${cap(viewName)}Data = {
${viewDataFieldsStr(colDs, vs)}
  }`;

const colViewsDataStr = (colName: string, colSpec: CollectionSpec | undefined) =>
  Object.entries(colSpec?.view ?? {})
    .map(viewDataStr(colName, colSpec?.data))
    .join('\n\n');

const docCreationDataStr = (collectionName: string, colDs: CollectionDS | undefined) =>
  `export type ${cap(collectionName)}CreationData = {
${docDataFieldsStr(colDs)}
}`;

const withIsr = (
  colName: string,
  webPages: readonly string[],
  colSpec: CollectionSpec | undefined
) =>
  Object.keys(colSpec?.view ?? {}).includes('page') && webPages.includes(`web/${colName}/[id].tsx`);

const useCreationStr = (
  colName: string,
  colSpec: CollectionSpec | undefined,
  webPages: readonly string[]
) => `export const use${cap(colName)}Creation = () =>
   useDocCreation${withIsr(colName, webPages, colSpec) ? 'With' : 'Without'}Page<${cap(
  colName
)}Data, ${cap(colName)}CreationData>(
     masmott.firebase,
     '${colName}',
     masmott.spec.${colName}.view
   );`;

const collectionStr =
  (webPages: readonly string[]) =>
  ([colName, colSpec]: readonly [string, CollectionSpec | undefined]) =>
    `${docDataStr(colName, colSpec?.data)}

${colViewsDataStr(colName, colSpec)}

${docCreationDataStr(colName, colSpec?.data)}

${useCreationStr(colName, colSpec, webPages)}
`;
const collectionsStr = (spec: Spec, webPages: readonly string[]) =>
  Object.entries(spec).map(collectionStr(webPages)).join('\n\n');

export const hooksStr = (
  spec: Spec,
  webPages: readonly string[]
) => `import { useDocCreationWithPage, useDocCreationWithoutPage } from 'masmott';
import { masmott } from './masmott.config';
${collectionsStr(spec, webPages)}
`;
