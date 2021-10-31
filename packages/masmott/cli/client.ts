import assertNever from 'assert-never';
import mapValues from 'lodash/mapValues';
import { Dict, RefIdFieldSpec, SrcFieldSpec, StringFieldSpec } from '../src/types';
import { CollectionSpec, MasmottConfig } from './types';

function getSrcString(collectionSchema: CollectionSpec): Dict<SrcFieldSpec> {
  return mapValues(collectionSchema.data, (fieldSchema) => {
    if (fieldSchema.type === 'string') {
      const field: StringFieldSpec = {
        type: 'string',
      };
      return field;
    }
    if (fieldSchema.type === 'refId') {
      const field: RefIdFieldSpec = {
        type: 'refId',
        refCollection: fieldSchema.referTo,
      };
      return field;
    }
    assertNever(fieldSchema);
  });
}

export function getClientStr({ schema, firebase }: MasmottConfig): string {
  const spec = mapValues(schema, (collectionSchema) => {
    return {
      src: getSrcString(collectionSchema),
      views: {},
    };
  });

  return `/* istanbul ignore file */

import { Doc, DocCreation, FirebaseOptions, Spec, useDoc, useDocCreation } from 'masmott';

export const firebaseOptions: FirebaseOptions = { projectId: '${firebase.projectId}' };

export const spec = ${JSON.stringify(spec)}

  `;
}
