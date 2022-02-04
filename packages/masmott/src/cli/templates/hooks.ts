import { CollectionDS, CollectionSpec, Spec, VS } from 'core';

import { capitalize } from './utils';

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
  `export type ${capitalize(collectionName)} = {
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
    `export type ${capitalize(colName)}${capitalize(viewName)} = {
${viewDataFieldsStr(colDs, vs)}
  }`;

const colViewsDataStr = (colName: string, colSpec: CollectionSpec | undefined) =>
  Object.entries(colSpec?.view ?? {})
    .map(viewDataStr(colName, colSpec?.data))
    .join('\n\n');

const collectionStr = ([colName, colSpec]: readonly [string, CollectionSpec | undefined]) =>
  `${docDataStr(colName, colSpec?.data)}
${colViewsDataStr(colName, colSpec)}`;

const collectionsStr = (spec: Spec) => Object.entries(spec).map(collectionStr).join('\n\n');

export const hooksStr = (spec: Spec) => `import { useDocCreationWithPage } from 'masmott';
import { masmott } from './masmott.config';
${collectionsStr(spec)}
`;
