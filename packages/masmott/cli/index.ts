#!/usr/bin/env node

import assertNever from 'assert-never';
import { isLeft } from 'fp-ts/lib/Either';
import * as fs from 'fs';
import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import * as yaml from 'js-yaml';
import mapValues from 'lodash/mapValues';
import { Dict, RefIdFieldSpec, SrcFieldSpec, StringFieldSpec, ViewSpec } from '../src';

const StringFieldSchema = t.type({ type: t.literal('string') });

const RefIdFieldSchema = t.type({
  type: t.literal('refId'),
  referTo: t.string,
});

const FieldSchema = t.union([StringFieldSchema, RefIdFieldSchema]);

const CollectionSchema = t.union([t.record(t.string, FieldSchema), t.null]);

type CollectionSchema = t.TypeOf<typeof CollectionSchema>;

const Schema = t.record(t.string, CollectionSchema);

const CountViewSchema = t.type({
  count: t.string,
  groupBy: t.string,
});

const ViewSchema = t.record(t.string, CountViewSchema);

const CollectionViewSchemas = t.record(t.string, ViewSchema);

const ViewSchemas = t.record(t.string, CollectionViewSchemas);

const FirebaseConfig = t.type({
  projectId: t.string,
});

const Masmott = t.type({
  schema: Schema,
  views: ViewSchemas,
  firebase: FirebaseConfig,
});

type Masmott = t.TypeOf<typeof Masmott>;

const specStr = fs.readFileSync('./masmott.yaml', { encoding: 'utf-8' });
const unsafeSpecData = yaml.load(specStr);
const decodeResult = Masmott.decode(unsafeSpecData);

if (isLeft(decodeResult)) {
  throw Error(PathReporter.report(decodeResult)[0]);
}

const { schema, views, firebase } = decodeResult.right;

function getSrcString(collectionSchema: CollectionSchema): Dict<SrcFieldSpec> {
  return mapValues(collectionSchema, (fieldSchema) => {
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

function getViewsString(): Dict<ViewSpec> {}

const spec = mapValues(schema, (collectionSchema, collectionName) => {
  return {
    src: getSrcString(collectionSchema),
    views: getViewsString(collectionSchema, collectionName),
  };
});

const clientStr = `/* istanbul ignore file */

import { Doc, DocCreation, FirebaseOptions, Spec, useDoc, useDocCreation } from 'masmott';

export const firebaseOptions: FirebaseOptions = { projectId: '${firebase.projectId}' };

export const spec = ${JSON.stringify(spec)}

  `;

fs.writeFileSync('masmott.ts', clientStr);
