import assertNever from 'assert-never';
import { isEmpty, mapValues } from 'lodash';
import capitalize from 'lodash/capitalize';
import {
  CollectionDataSpec,
  CollectionSpec,
  MasmottConfig,
  MaybeCollectionViews,
  View,
} from '../../src/types/io';
import { jsonStringify } from './json-stringify';

function makeCollectionDataTypeStr(collectionDataSpec: CollectionDataSpec): string {
  if (isEmpty(collectionDataSpec)) {
    return 'Record<string, never>';
  }
  const mappedDataTypes = mapValues(collectionDataSpec, (fieldSchema) => {
    if (fieldSchema.type === 'refId') {
      return 'string';
    }
    if (fieldSchema.type === 'string') {
      return 'string';
    }
    assertNever(fieldSchema);
  });
  return jsonStringify(mappedDataTypes);
}

function makeCollectionCreationDataTypeStr(collectionDataSpec: CollectionDataSpec): string {
  if (isEmpty(collectionDataSpec)) {
    return 'Record<string, never>';
  }
  const mappedDataTypes = mapValues(collectionDataSpec, (fieldSchema) => {
    if (fieldSchema.type === 'refId') {
      return 'string';
    }
    if (fieldSchema.type === 'string') {
      return 'string';
    }
    assertNever(fieldSchema);
  });
  return jsonStringify(mappedDataTypes);
}

function makeViewStr(collectionName: string, viewName: string, view: View): string {
  const capColName = capitalize(collectionName);
  const capViewName = capitalize(viewName);
  const materializeVarStr = `materialize${capColName}${capViewName}`;

  const viewFields = Object.entries(view);

  const selectedFieldStrs = viewFields
    .filter(([, field]) => field === undefined)
    .map(([fieldName]) => `'${fieldName}'`);
  const genericSelectedFieldStrs =
    selectedFieldStrs.length > 0 ? selectedFieldStrs.join('|') : 'never';

  const countFieldStrs = viewFields
    .filter(([, field]) => field?.type === 'count')
    .map(([fieldName]) => `'${fieldName}'`);
  const genericsCountFieldStrs = countFieldStrs.length > 0 ? countFieldStrs.join('|') : 'never';

  return `const ${materializeVarStr} 
  = makeMaterialize<
      ${capColName}CreationData, 
      ${genericSelectedFieldStrs}, 
      ${genericsCountFieldStrs}
    >(
      [${countFieldStrs.join(',')}],
      [${selectedFieldStrs.join(',')}]
    )
    
  export type ${capColName}${capViewName}Data = ReturnType<typeof ${materializeVarStr}>;`;
}

function makeCollectionViewsStr(
  collectionName: string,
  collectionViews: MaybeCollectionViews
): string {
  return Object.entries(collectionViews ?? {})
    .map(([viewName, view]) => makeViewStr(collectionName, viewName, view))
    .join('\n\n');
}

function makeCollectionStr([collectionName, collectionSchema]: readonly [
  string,
  CollectionSpec
]): string {
  const capName = capitalize(collectionName);
  return `export type ${capName}Data = ${makeCollectionDataTypeStr(collectionSchema.data)}

        export type ${capName}CreationData = 
          ${makeCollectionCreationDataTypeStr(collectionSchema.data)}

        ${makeCollectionViewsStr(collectionName, collectionSchema.view)}`;
}

export function makeClientStr({ schema, firebase }: MasmottConfig): string {
  return `/* istanbul ignore file */

import { 
  makeMaterialize, 
  Doc, 
  DocCreation, 
  FirebaseOptions, 
  Spec, 
  useDoc, 
  useDocCreation
 } from 'masmott';

export const firebaseOptions: FirebaseOptions = { projectId: '${firebase.projectId}' };

export const spec = ${jsonStringify(schema)}

${Object.entries(schema).map(makeCollectionStr).join('\n\n')}

  `;
}
