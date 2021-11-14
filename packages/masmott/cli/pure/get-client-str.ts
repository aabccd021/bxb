import assertNever from 'assert-never';
import { isEmpty, mapValues } from 'lodash';
import capitalize from 'lodash/capitalize';
import { CollectionDataSpec, MasmottConfig, Schema, View, ViewSchemas } from '../types';
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

function makeViewTypeStr(view: View): string {
  const mappedDataTypes = mapValues(view, (viewField) => {
    if (viewField.type === 'count') {
      return 'number';
    }
    assertNever(viewField.type);
  });
  return jsonStringify(mappedDataTypes);
}

function makeCollectionViewsTypeStr(
  collectionName: string,
  collectionViewSchemas: ViewSchemas
): string {
  if (collectionViewSchemas === undefined) {
    return '';
  }
  return Object.entries(collectionViewSchemas)
    .map(
      ([viewName, view]) =>
        `export type ${capitalize(collectionName)}${capitalize(viewName)}Data = 
         ${makeViewTypeStr(view)}
        `
    )
    .join('\n\n');
}

function makeDataTypesStr(schema: Schema): string {
  return Object.entries(schema)
    .map(
      ([collectionName, collectionSchema]) =>
        `export type ${capitalize(collectionName)}Data = 
          ${makeCollectionDataTypeStr(collectionSchema.data)}

        export type ${capitalize(collectionName)}CreationData = 
          ${makeCollectionCreationDataTypeStr(collectionSchema.data)}

        ${makeCollectionViewsTypeStr(collectionName, collectionSchema.view)}`
    )
    .join('\n\n');
}

export function makeClientStr({ schema, firebase }: MasmottConfig): string {
  return `/* istanbul ignore file */

import { Doc, DocCreation, FirebaseOptions, Spec, useDoc, useDocCreation } from 'masmott';

export const firebaseOptions: FirebaseOptions = { projectId: '${firebase.projectId}' };

export const spec = ${jsonStringify(schema)}

${makeDataTypesStr(schema)}

  `;
}
