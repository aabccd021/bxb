import { CollectionSpec, DFS, Masmott, VS } from 'core';

const surroundSingleQuotes = (s: string) => `'${s}'`;

const dataKeys = (colSpec: CollectionSpec) =>
  Object.keys(colSpec.data ?? {})
    .map(surroundSingleQuotes)
    .join(', ');

const dataField = ([fieldName]: readonly [string, DFS]) =>
  `        request.resource.data.${fieldName} is string`;

const dataFields = (colSpec: CollectionSpec) =>
  Object.entries(colSpec.data ?? {})
    .map(dataField)
    .join(' &&\n');

const dataRule = ([colName, colSpec]: readonly [
  string,
  CollectionSpec
]) => `match /${colName}/{docId} {
      allow create: if 
        request.resource.data.keys().hasOnly([${dataKeys(colSpec)}]) &&
${dataFields(colSpec)};
    }`;

const viewRule =
  (colName: string) =>
  ([viewName]: readonly [string, VS]) =>
    `    match /${colName}_${viewName}/{docId} {
      allow get: if true;
    }`;

const viewsRule = ([colName, colSpec]: readonly [string, CollectionSpec]) =>
  Object.entries(colSpec.view ?? {})
    .map(viewRule(colName))
    .join('\n');

const colRule = (colEntry: readonly [string, CollectionSpec]) => `${dataRule(colEntry)}
${viewsRule(colEntry)}`;

const colsRule = (masmott: Masmott) => Object.entries(masmott.spec).map(colRule).join('\n');

export const rules = (masmott: Masmott) => `service cloud.firestore {
  match /databases/{database}/documents {
    ${colsRule(masmott)}
  }
}
`;
